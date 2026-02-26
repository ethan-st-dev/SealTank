using Microsoft.AspNetCore.Mvc;

namespace SealTank.Server.Controllers;

[ApiController]
[Route("api/lobbies")]
public class LobbyController : ControllerBase
{
    private readonly LobbyManager _lobbyManager;

    public LobbyController(LobbyManager lobbyManager)
    {
        _lobbyManager = lobbyManager;
    }

    [HttpGet]
    public IActionResult GetLobbies()
    {
        var lobbies = _lobbyManager.GetActiveLobbies();
        return Ok(lobbies);
    }

    [HttpPost("create")]
    public IActionResult CreateLobby([FromBody] CreateLobbyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || 
            string.IsNullOrWhiteSpace(request.RoomType) || 
            string.IsNullOrWhiteSpace(request.Host))
        {
            return BadRequest(new { error = "Missing required fields" });
        }

        try
        {
            var lobby = _lobbyManager.CreateLobby(
                request.Name,
                request.RoomType,
                request.SceneName ?? "Scene",
                request.Host,
                request.MaxPlayers > 0 ? request.MaxPlayers : 8
            );

            return Ok(lobby);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating lobby: {ex.Message}");
            return StatusCode(500, new { error = "Failed to create lobby" });
        }
    }

    [HttpPost("{id}/join")]
    public IActionResult JoinLobby(string id, [FromBody] JoinLobbyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
        {
            return BadRequest(new { error = "playerName is required" });
        }

        var lobby = _lobbyManager.JoinLobby(id, request.PlayerName);

        if (lobby == null)
        {
            return BadRequest(new { error = "Lobby not found or full" });
        }

        return Ok(lobby);
    }

    [HttpPost("{id}/leave")]
    public IActionResult LeaveLobby(string id, [FromBody] LeaveLobbyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerName))
        {
            return BadRequest(new { error = "playerName is required" });
        }

        _lobbyManager.LeaveLobby(id, request.PlayerName);
        return Ok(new { success = true });
    }

    [HttpGet("{id}")]
    public IActionResult GetLobby(string id)
    {
        var lobby = _lobbyManager.GetLobby(id);

        if (lobby == null)
        {
            return NotFound(new { error = "Lobby not found" });
        }

        return Ok(lobby);
    }
}

public class CreateLobbyRequest
{
    public string Name { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string? SceneName { get; set; }
    public string Host { get; set; } = string.Empty;
    public int MaxPlayers { get; set; }
}

public class JoinLobbyRequest
{
    public string PlayerName { get; set; } = string.Empty;
}

public class LeaveLobbyRequest
{
    public string PlayerName { get; set; } = string.Empty;
}
