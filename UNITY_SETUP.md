# Unity Setup for Multiplayer Lobbies

Complete guide for setting up Needle Engine networking in Unity.

## Step 1: Install Needle Engine Package

1. Open Unity
2. Window → Package Manager
3. Click "+" → Add package from git URL
4. Enter: `https://github.com/needle-tools/needle-engine-support.git?path=/package`
5. Wait for installation to complete

## Step 2: Scene Setup

### Create Scene Hierarchy

```
Scene Root (GameObject)
├── SceneRoot (with ExportInfo component)
│   ├── Networking (component)
│   └── SyncedRoom (component)
├── Main Camera
├── Directional Light
├── Environment
│   ├── Water/Ocean Plane
│   ├── Arena Boundaries
│   └── Floor
└── PlayerSpawnPoints (empty GameObject)
    ├── SpawnPoint 1
    ├── SpawnPoint 2
    └── SpawnPoint 3...
```

## Step 3: Add Networking Components

### On SceneRoot GameObject:

1. **Add ExportInfo Component**
   - Click: Add Component → Needle → Export Info
   - Set "Directory Name" to your project name (e.g., "sealtank")
   - Set path to React client: `../../apps/client/public/assets`
   - Check "Generate Project"

2. **Add Networking Component**
   - Click: Add Component → Needle → Networking
   - Settings:
     - Backend URL: Leave empty (uses default Needle backend)
     - Auto Join Room: **UNCHECK** (we join via React)
     - Start In Room: **UNCHECK**

3. **Add SyncedRoom Component**
   - Click: Add Component → Needle → Synced Room
   - Settings:
     - Room Name: Leave empty (set from React)
     - Auto Rejoin: Check this
     - Max Players: 8

## Step 4: Create Player Prefab

### Player Setup

1. Create new GameObject called "SealPlayer"
2. Add your seal model/mesh
3. Add required components:

**Required Components:**
- **SyncedTransform** (Needle → Synced Transform)
  - Syncs position, rotation across network
  
- **Avatar** (Needle → Avatar)
  - Marks this as a player avatar
  - Set "Is XR Rig": false (unless using VR)
  
- **Rigidbody** (optional, for physics)
  - Use if your seal uses physics movement
  
- **Your Player Controller Script**
  - Your custom movement/control code

4. Drag the GameObject into Assets to create a prefab
5. Delete from scene (it will be instantiated at runtime)

### Configure Avatar Component

On the Avatar component:
- "Avatar Prefab": Leave empty (self-reference)
- "Is Local": Will be set automatically
- "Owner": Will be assigned automatically

## Step 5: Player Spawning

### Create Spawn Points

1. Create empty GameObject: "PlayerSpawnPoints"
2. Add child objects for each spawn location
3. Position them around your arena
4. Add component to each: **SpawnPoint** (Needle → Spawn Point)

### Configure Spawning

1. Find your SceneRoot with Networking
2. Add **AvatarBehaviour** component if not present
3. Settings:
   - Avatar Prefab: Drag your SealPlayer prefab here
   - Spawn Mode: "At Spawn Point"

## Step 6: Create Multiple Scene Variants (Optional)

For different room types (ice, deep sea, tropical):

### Option A: Single Scene with Variants
1. Create prefabs for each environment type
2. Enable/disable based on room metadata
3. Use script to load correct assets

### Option B: Multiple Scenes
1. Duplicate your main scene
2. Rename: StandardArena, IceArena, DeepSea, TropicalBay
3. Modify environment in each
4. Export each separately

## Step 7: Export Your Scene

1. Select GameObject with ExportInfo
2. In Inspector, find "Needle Engine" section
3. Click **"Build Project"** or **"Play in Browser"**
4. Wait for export to complete

### Verify Export

Check these files were created:
- `apps/client/public/assets/Scene.glb` (or your scene name)
- `apps/client/public/assets/*.bin` (binary data)
- `apps/client/public/assets/*.gltf` (if text format)

## Step 8: Test Networking

### Test in Unity Editor

1. Click Play in Unity
2. Unity should connect to Needle's networking backend
3. Check Console for connection messages

### Test with React Client

1. Start lobby server:
   ```bash
   cd apps/server
   npm install
   npm run dev
   ```

2. Start React client:
   ```bash
   cd apps/client
   npm run dev
   ```

3. Open browser to React app
4. Create a lobby
5. Open another browser window (incognito)
6. Join the same lobby
7. Both players should see each other!

## Step 9: Syncing Game Objects (Optional)

To sync other objects beyond players:

1. Add **SyncedTransform** to any GameObject you want to sync
2. For custom data, add **SyncedObject** component
3. Use Needle's networking API in scripts

Example syncing a ball:
```csharp
// Add SyncedTransform component to ball in Unity
// That's it! Movement will sync automatically
```

## Troubleshooting

### "Can't see other players"
- Check Networking component is on scene root
- Verify Avatar component is on player prefab
- Check SpawnPoint components exist
- Look for errors in browser console

### "Lobby server not connecting"
- Make sure server is running: `cd apps/server && npm run dev`
- Check port 3001 is not blocked
- Verify WebSocket connection in browser dev tools

### "Players not spawning"
- Check AvatarBehaviour has correct prefab reference
- Verify SpawnPoint components exist
- Check Console for spawn errors

### "Export fails"
- Verify ExportInfo path is correct
- Check you have write permissions
- Look for errors in Unity Console

## Additional Components

### Synced Animation
- Add **SyncedAnimator** to sync animations

### Voice Chat
- Add **VoipPeer** for built-in voice communication

### Ownership Transfer
- Use **SyncedObject.RequestOwnership()** to control objects

## Resources

- Needle Documentation: https://docs.needle.tools
- Needle Networking: https://docs.needle.tools/networking
- Needle Samples: https://github.com/needle-tools/needle-engine-samples
