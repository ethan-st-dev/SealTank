using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for HTTPS on all interfaces
var port = Environment.GetEnvironmentVariable("PORT") ?? "3001";
builder.WebHost.UseUrls($"https://0.0.0.0:{port}");
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port), listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

// Add services
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allow any origin for local dev
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for secure WebSocket connections
    });
});
builder.Services.AddSingleton<LobbyManager>();

var app = builder.Build();

// Configure middleware
app.UseCors();
app.UseWebSockets();

// Health check endpoint
app.MapGet("/", () => "🚀 SealTank Server is running!");
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

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

Console.WriteLine($"🚀 Lobby server running on port {port} (HTTPS)");
Console.WriteLine($"📡 WebSocket server ready for connections");
Console.WriteLine($"🌐 API endpoints:");
Console.WriteLine($"   GET  https://localhost:{port}/ (health check)");
Console.WriteLine($"   GET  https://localhost:{port}/api/lobbies");
Console.WriteLine($"   POST https://localhost:{port}/api/lobbies/create");
Console.WriteLine($"   POST https://localhost:{port}/api/lobbies/{{id}}/join");
Console.WriteLine($"   POST https://localhost:{port}/api/lobbies/{{id}}/leave");
Console.WriteLine($"💡 Server listening on all network interfaces (0.0.0.0:{port})");
Console.WriteLine($"⚠️  When accessing via IP address (e.g., https://192.168.x.x:{port}),");
Console.WriteLine($"    you'll get a certificate warning - click 'Advanced' and 'Proceed' to accept it");
Console.WriteLine($"🔥 If you can't access from other devices, check Windows Firewall:");
Console.WriteLine($"    Run as admin: netsh advfirewall firewall add rule name=\"SealTank Server\" dir=in action=allow protocol=TCP localport={port}");

app.Run();
