# SealTank Lobby System - Quick Start

## What's Set Up

✅ **Backend Lobby Server** (`apps/server/`)
- WebSocket server for real-time lobby updates
- REST API for lobby management
- Automatic lobby cleanup

✅ **React Frontend** (`apps/client/`)
- Lobby browser with live updates
- Create lobby interface
- Automatic connection to lobbies

✅ **Needle Engine Integration**
- Room-based multiplayer ready
- Each lobby = separate game instance

## Getting Started

### 1. Install Server Dependencies

```bash
cd apps/server
npm install
```

### 2. Start the Lobby Server

```bash
npm run dev
```

You should see:
```
🚀 Lobby server running on port 3001
📡 WebSocket server ready for connections
```

### 3. Start the React Client

In a new terminal:
```bash
cd apps/client
npm run dev
```

### 4. Test the Lobby System

1. Open browser to React app (usually http://localhost:5173)
2. Enter a username
3. Click "Create Lobby"
4. Name your lobby and select room type
5. Click "Create & Launch"

### 5. Test Multiplayer

1. Open another browser window (or incognito)
2. Enter different username
3. You should see the lobby you created
4. Click to join

**Note:** Multiplayer won't work yet until Unity is set up!

## Next Steps

### Configure Unity (Required for Multiplayer)

Follow the detailed instructions in: **[UNITY_SETUP.md](UNITY_SETUP.md)**

Key steps:
1. Install Needle Engine package
2. Add Networking + SyncedRoom components
3. Create player prefab with SyncedTransform
4. Export scene to React app
5. Test with multiple browser windows

### Quick Unity Checklist

- [ ] Needle Engine package installed
- [ ] ExportInfo component configured
- [ ] Networking component added (Auto Join Room: OFF)
- [ ] SyncedRoom component added
- [ ] Player prefab with Avatar + SyncedTransform
- [ ] SpawnPoints created
- [ ] Scene exported to `apps/client/public/assets/`

## How It Works

1. **React App** connects to lobby server via WebSocket
2. **Player creates lobby** → Server tracks it and broadcasts to all clients
3. **Player joins lobby** → React passes `room={lobbyId}` to Needle Engine
4. **Needle Engine** connects to its networking backend with the room ID
5. **Players in same lobby** are in same Needle room → can see each other
6. **Different lobbies** = different Needle rooms → completely separate

## Architecture

```
[Browser 1]                    [Browser 2]
    ↓                              ↓
[React Lobby UI]            [React Lobby UI]
    ↓                              ↓
[WebSocket Connection]  ←→  [Lobby Server]  ←→  [WebSocket Connection]
    ↓                                                  ↓
[Needle Engine]                              [Needle Engine]
room="room_123"                              room="room_123"
    ↓                                                  ↓
[Needle Networking Backend (Glitch/Websocket)]
         ↓                                            ↓
    Players sync in same room
```

## Folder Structure

```
SealTank/
├── apps/
│   ├── client/              # React app
│   │   ├── src/
│   │   │   ├── App.tsx      # Main app (handles lobby data)
│   │   │   ├── components/
│   │   │   │   └── LobbyPage.tsx  # Lobby UI
│   │   │   └── NeedleEngine.tsx
│   │   └── public/
│   │       └── assets/       # Unity exports go here
│   │           └── Scene.glb
│   └── server/              # Lobby management server
│       ├── src/
│       │   ├── server.ts    # Express + WebSocket server
│       │   └── LobbyManager.ts  # Lobby logic
│       └── package.json
└── Unity-Project/           # Unity project
    └── Assets/
        └── Scenes/
```

## Environment Variables (Optional)

Create `.env` in `apps/server/`:
```
PORT=3001
```

Create `.env` in `apps/client/`:
```
VITE_LOBBY_SERVER_URL=http://localhost:3001
VITE_LOBBY_WS_URL=ws://localhost:3001
```

## Production Deployment

### Server
```bash
cd apps/server
npm run build
npm start
```

### Client
```bash
cd apps/client
npm run build
# Serve the dist/ folder
```

### Unity
- Export scenes before building client
- Ensure paths are correct in ExportInfo
- Consider using different scenes for different lobby types

## Common Issues

### "Lobby server not connecting"
- Check server is running on port 3001
- Check firewall isn't blocking WebSocket
- Look for errors in server console

### "Can't see lobby I created"
- Check WebSocket connection in browser DevTools
- Verify server console shows lobby creation
- Refresh browser

### "Players can't see each other in game"
- Unity networking not set up yet (see UNITY_SETUP.md)
- Check Needle Engine has `room` prop set
- Verify both players are in same lobby ID

### "Export from Unity not working"
- Check ExportInfo path points to `apps/client/public/assets`
- Verify you have write permissions
- Check Unity console for errors

## Development Tips

1. **Keep server running** while developing
2. **Browser DevTools** → Network tab to debug WebSocket
3. **Unity Console** for export errors
4. **Server logs** show lobby creation/joining
5. **Test with multiple browser windows** (including incognito)

## Need Help?

- Check [UNITY_SETUP.md](UNITY_SETUP.md) for detailed Unity instructions
- Needle Docs: https://docs.needle.tools
- Needle Discord: https://discord.needle.tools
