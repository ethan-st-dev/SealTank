# SealTank Lobby Server (ASP.NET Core)

WebSocket and REST API server for managing game lobbies.

## Requirements

- .NET 8.0 SDK or later

## Development

```bash
dotnet run
```

Server will start on http://localhost:3001

## Production

```bash
dotnet publish -c Release
dotnet bin/Release/net8.0/SealTank.Server.dll
```

## API Endpoints

- `GET /api/lobbies` - Get all active lobbies
- `POST /api/lobbies/create` - Create a new lobby
- `POST /api/lobbies/:id/join` - Join a lobby
- `POST /api/lobbies/:id/leave` - Leave a lobby
- `GET /api/lobbies/:id` - Get lobby details

## WebSocket

Connect to `ws://localhost:3001/ws` to receive real-time lobby updates.

Messages:
- `{ type: 'lobby-list', lobbies: [...] }` - Lobby list updates

## Environment Variables

- `PORT` - Set custom port (default: 3001)

## Notes

This is an ASP.NET Core port of the original Node.js server with identical functionality.
