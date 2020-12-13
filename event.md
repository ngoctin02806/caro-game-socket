## All event of server that is received from client

> Event is emitted from server

```javascript
   
```

> Event is emitted from client

```javascript
   - `emit-user-login`: emit event to activate online state
   payload: {
       user_id: "example"
   }
```

```javascript
   - `emit-conversation-single`: emit event to join room
   payload: {
      room_id: "conversation_id",
      user_id: "Q6VB8LYM-pI33R6vV1j9wThUdJ2YP9qFpaXE6qeR",
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
