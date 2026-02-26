using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddSingleton<LobbyManager>();

var app = builder.Build();

// Configure middleware
app.UseCors();
app.UseWebSockets();

// WebSocket endpoint
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var lobbyManager = app.Services.GetRequiredService<LobbyManager>();
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await lobbyManager.HandleWebSocketAsync(webSocket);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "3001";
Console.WriteLine($"🚀 Lobby server running on port {port}");
Console.WriteLine($"📡 WebSocket server ready for connections");
Console.WriteLine($"🌐 API endpoints:");
Console.WriteLine($"   GET  http://localhost:{port}/api/lobbies");
Console.WriteLine($"   POST http://localhost:{port}/api/lobbies/create");
Console.WriteLine($"   POST http://localhost:{port}/api/lobbies/{{id}}/join");
Console.WriteLine($"   POST http://localhost:{port}/api/lobbies/{{id}}/leave");

app.Run($"http://localhost:{port}");
