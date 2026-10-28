import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let connectedClients = new Set();

export const initSse = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    connectedClients.add(socket.id);
    console.log(`Client connected: ${socket.id}, total: ${connectedClients.size}`);

    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      console.log(`Client disconnected: ${socket.id}, total: ${connectedClients.size}`);
    });
  });

  // Expose SSE endpoint
  return {
    publish: (event, data) => {
      io.emit(event, data);
    },
    getClientCount: () => connectedClients.size,
  };
};