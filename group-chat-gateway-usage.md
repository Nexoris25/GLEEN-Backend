# Group Chat Gateway Usage Guide

This document explains how to use the Socket.IO-based Group Chat Gateway in the GLEEN Backend.

## Overview
- The gateway enables real-time group chat using Socket.IO and Redis for scaling.
- Events: `joinRoom`, `leaveRoom`, `sendMessage`, `markAsRead`, plus connection/disconnection notifications.
- Each event requires a `userId` for user context.

## Connecting
- Connect to the namespace: `/group-chat`
- Pass `userId` in the handshake query string:
  ```js
  const socket = io('/group-chat', { query: { userId: 'USER_UUID' } });
  ```

## Events & Payloads

### 1. Join Room
- **Client emits:** `joinRoom`
- **Payload:**
  ```json
  { "groupId": "GROUP_UUID", "userId": "USER_UUID" }
  ```
- **Server broadcasts:** `userJoined` to the room to signify user is online

### 2. Leave Room
- **Client emits:** `leaveRoom`
- **Payload:**
  ```json
  { "groupId": "GROUP_UUID", "userId": "USER_UUID" }
  ```
- **Server broadcasts:** `userLeft` to the room to signify user is offline

### 3. Send Message
- **Client emits:** `sendMessage`
- **Payload:**
  ```json
  { "groupId": "GROUP_UUID", "userId": "USER_UUID", "message": "Hello!" }
  ```
- **Server broadcasts:** `newMessage` to the room
- **Message is persisted in DB**

### 4. Mark Message as Read
- **Client emits:** `markAsRead`
- **Payload:**
  ```json
  { "groupId": "GROUP_UUID", "userId": "USER_UUID", "messageId": "MESSAGE_UUID" }
  ```
- **Server broadcasts:** `messageRead` to the room

### 5. Connection/Disconnection
- **Server emits:**
  - `userConnected` when a user connects
  - `userDisconnected` when a user disconnects

## Example Client Usage
```js
const socket = io('/group-chat', { query: { userId: 'USER_UUID' } });

// Join a group chat room
socket.emit('joinRoom', { groupId: 'GROUP_UUID', userId: 'USER_UUID' });

// Send a message
socket.emit('sendMessage', { groupId: 'GROUP_UUID', userId: 'USER_UUID', message: 'Hello!' });

// Mark a message as read
socket.emit('markAsRead', { groupId: 'GROUP_UUID', userId: 'USER_UUID', messageId: 'MESSAGE_UUID' });

// Listen for events
socket.on('newMessage', (msg) => console.log('New message:', msg));
socket.on('userJoined', (data) => console.log('User joined:', data));
socket.on('userLeft', (data) => console.log('User left:', data));
socket.on('messageRead', (data) => console.log('Message read:', data));
socket.on('userConnected', (data) => console.log('User connected:', data));
socket.on('userDisconnected', (data) => console.log('User disconnected:', data));
```

## Notes
- Always provide `userId` in every event payload.
- Redis is used for message scaling across multiple server instances.
- Message persistence is handled by the backend service.
- No built-in authentication: clients must securely provide `userId`.

## Troubleshooting
- Ensure Socket.IO client version matches server.
- If using Redis, verify connection and configuration.
- For authentication, consider adding JWT or session validation in future.
