using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

public class Lobby
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string SceneName { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public List<string> Players { get; set; } = new();
    public int MaxPlayers { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class LobbyManager
{
    private readonly ConcurrentDictionary<string, Lobby> _lobbies = new();
    private readonly ConcurrentBag<WebSocket> _clients = new();

    public Lobby CreateLobby(string name, string roomType, string sceneName, string host, int maxPlayers)
    {
        var lobby = new Lobby
        {
            Id = GenerateRoomId(),
            Name = name,
            RoomType = roomType,
            SceneName = sceneName,
            Host = host,
            Players = new List<string> { host },
            MaxPlayers = maxPlayers,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _lobbies.TryAdd(lobby.Id, lobby);
        Console.WriteLine($"✅ Lobby created: {lobby.Name} ({lobby.Id})");
        
        _ = BroadcastLobbyListAsync();
        
        return lobby;
    }

    public Lobby? JoinLobby(string lobbyId, string playerName)
    {
        if (!_lobbies.TryGetValue(lobbyId, out var lobby))
        {
            Console.WriteLine($"❌ Lobby not found: {lobbyId}");
            return null;
        }

        if (lobby.Players.Count >= lobby.MaxPlayers)
        {
            Console.WriteLine($"❌ Lobby full: {lobby.Name}");
            return null;
        }

        if (!lobby.Players.Contains(playerName))
        {
            lobby.Players.Add(playerName);
            Console.WriteLine($"✅ {playerName} joined lobby: {lobby.Name} ({lobby.Players.Count}/{lobby.MaxPlayers})");
            _ = BroadcastLobbyListAsync();
        }

        return lobby;
    }

    public void LeaveLobby(string lobbyId, string playerName)
    {
        if (!_lobbies.TryGetValue(lobbyId, out var lobby))
            return;

        lobby.Players.Remove(playerName);
        Console.WriteLine($"👋 {playerName} left lobby: {lobby.Name} ({lobby.Players.Count}/{lobby.MaxPlayers})");

        // Remove lobby if empty or if host left
        if (lobby.Players.Count == 0 || lobby.Host == playerName)
        {
            _lobbies.TryRemove(lobbyId, out _);
            Console.WriteLine($"🗑️  Lobby removed: {lobby.Name}");
        }

        _ = BroadcastLobbyListAsync();
    }

    public List<Lobby> GetActiveLobbies()
    {
        return _lobbies.Values.Where(l => l.IsActive).ToList();
    }

    public Lobby? GetLobby(string lobbyId)
    {
        _lobbies.TryGetValue(lobbyId, out var lobby);
        return lobby;
    }

    public async Task HandleWebSocketAsync(WebSocket webSocket)
    {
        _clients.Add(webSocket);
        Console.WriteLine($"📡 Client connected ({_clients.Count} total)");

        // Send current lobby list to new client
        await SendLobbyListAsync(webSocket);

        var buffer = new byte[1024 * 4];
        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ WebSocket error: {ex.Message}");
        }
        finally
        {
            // Remove client
            var clientsList = _clients.ToList();
            clientsList.Remove(webSocket);
            _clients.Clear();
            foreach (var client in clientsList)
            {
                _clients.Add(client);
            }
            Console.WriteLine($"📡 Client disconnected ({_clients.Count} total)");
        }
    }

    private async Task SendLobbyListAsync(WebSocket webSocket)
    {
        if (webSocket.State != WebSocketState.Open)
            return;

        var message = new
        {
            type = "lobby-list",
            lobbies = GetActiveLobbies()
        };

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);
        await webSocket.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None
        );
    }

    private async Task BroadcastLobbyListAsync()
    {
        var message = new
        {
            type = "lobby-list",
            lobbies = GetActiveLobbies()
        };

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);

        var sentCount = 0;
        var tasks = new List<Task>();

        foreach (var client in _clients)
        {
            if (client.State == WebSocketState.Open)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        await client.SendAsync(
                            new ArraySegment<byte>(bytes),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                        Interlocked.Increment(ref sentCount);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Failed to send to client: {ex.Message}");
                    }
                }));
            }
        }

        await Task.WhenAll(tasks);

        if (sentCount > 0)
        {
            Console.WriteLine($"📤 Broadcast lobby list to {sentCount} clients");
        }
    }

    private string GenerateRoomId()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var random = Guid.NewGuid().ToString("N").Substring(0, 9);
        return $"room_{timestamp}_{random}";
    }
}
