## All event of server that is received from client

> Event is emitted from server

```javascript
   - `joined-game-room`: emit event to notify client that user has joined room
   payload: {
      user_id: "RBWHl-P7J5tXm9nCPUQrkU-EmwG78pXovt3ue0Nx",
      username: "User A"
      avatar: "http://avatar.com"
   }
   
```

> Event is emitted from client

```javascript
   - `emit-user-login`: emit event to activate online state
   payload: {
       user_id: "example"
   }
```

```javascript
   - `emit-user-logout`: emit event to update status online of user
```

```javascript
   - `emit-conversation-single`: emit event to join room
   payload: {
      room_id: "conversation_id",
      partner_id: "RBWHl-P7J5tXm9nCPUQrkU-EmwG78pXovt3ue0Nx"
   }
```

```javascript
   - `emit-conversation-message`: emit event to broadcast to partners in room
   payload: {
      room_id: "conversation_id",
      message: {
         sender_id: "RBWHl-P7J5tXm9nCPUQrkU-EmwG78pXovt3ue0Nx",
         content: "Test message",
         type: 'CONVERSATION_SINGLE' | 'CONVERSATION_GROUP' | 'CONVERSATION_GAME'
      }
   }
```

```javascript
   - `emit-conversation-game-message`: emit event to broadcast to partners in room
   payload: {
      room_id: "conversation_id",
      message: {
         sender_id: "RBWHl-P7J5tXm9nCPUQrkU-EmwG78pXovt3ue0Nx",
         content: "Test message",
         type: 'CONVERSATION_SINGLE' | 'CONVERSATION_GROUP' | 'CONVERSATION_GAME'
      }
   }
```

```javascript
   - `emit-conversation-game`: emit event to join room
   payload: {
      room_id: "conversation_id",
      user_id: "RBWHl-P7J5tXm9nCPUQrkU-EmwG78pXovt3ue0Nx"
   }
```

```javascript
   - `emit-user-logout`: emit event to remove socket in PERSISTENT_SOCKETS
```

```javascript
   - `emit-rejoin-room`: emit a array of all conversations to socket server to rejoin room again
   payload: {
      conversations: ['conversationId 1', 'conversationId 2']
   }
```
