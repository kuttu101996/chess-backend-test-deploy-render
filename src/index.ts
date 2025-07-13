// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/db';

// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const corsOptions = {
//   origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
//     // Allow requests with no origin (mobile apps, curl, etc.)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = process.env.NODE_ENV === 'dev' 
//       ? ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000']
//       : ['https://yourdomain.com'];
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log('Blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
//       // Allow requests with no origin (mobile apps)
//       if (!origin) return callback(null, true);
      
//       const allowedOrigins = ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'];
      
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.log('Socket.IO blocked origin:', origin);
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['GET', 'POST'],
//     credentials: true
//   },
// });

// app.use(cors(corsOptions));
// app.use(express.json());

// // Handle preflight requests explicitly
// app.options('*', cors(corsOptions));

// // Add logging middleware for debugging
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
//   next();
// });

// app.get('/', (req, res) => {
//   res.send('Chess server is running!');
// });

// // API Routes
// import authRoutes from './routes/authRoutes';
// app.use('/api/auth', authRoutes);

// // Track all socket connections for proper cleanup
// const connections = new Set<any>();

// io.on('connection', (socket) => {
//   connections.add(socket);
//   console.log('a user connected:', socket.id);
  
//   socket.on('disconnect', () => {
//     connections.delete(socket);
//     console.log('user disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 4000;

// // Function to find available port
// const findAvailablePort = (startPort: number): Promise<number> => {
//   return new Promise((resolve, reject) => {
//     const testServer = server.listen(startPort, () => {
//       const port = (testServer.address() as any)?.port;
//       testServer.close(() => {
//         resolve(port);
//       });
//     });
    
//     testServer.on('error', (err: any) => {
//       if (err.code === 'EADDRINUSE') {
//         console.log(`Port ${startPort} is busy, trying ${startPort + 1}...`);
//         resolve(findAvailablePort(startPort + 1));
//       } else {
//         reject(err);
//       }
//     });
//   });
// };

// // Start server with port conflict handling
// let serverInstance: any;

// const startServer = async () => {
//   try {
//     const availablePort = await findAvailablePort(Number(PORT));
    
//     serverInstance = server.listen(availablePort, () => {
//       console.log(`Server is running on port ${availablePort}`);
//       if (availablePort !== Number(PORT)) {
//         console.log(`Note: Originally tried port ${PORT}, but it was in use`);
//       }
//     });
    
//     // Handle server errors after successful start
//     serverInstance.on('error', (err: any) => {
//       console.error('Server error:', err);
//       gracefulShutdown('serverError');
//     });
    
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// };

// // Start the server
// startServer();

// // Graceful shutdown function
// const gracefulShutdown = (signal: string) => {
//   console.log(`\nReceived ${signal}, shutting down gracefully...`);
  
//   // Close all socket connections
//   connections.forEach((socket: any) => {
//     socket.disconnect(true);
//   });
//   connections.clear();
  
//   // Close Socket.IO server
//   io.close(() => {
//     console.log('Socket.IO server closed');
    
//     // Close HTTP server if it exists
//     if (serverInstance) {
//       serverInstance.close(() => {
//         console.log('HTTP server closed');
//         process.exit(0);
//       });
//     } else {
//       process.exit(0);
//     }
//   });
  
//   // Force exit after 5 seconds if graceful shutdown fails
//   setTimeout(() => {
//     console.log('Could not close connections in time, forcefully shutting down');
//     process.exit(1);
//   }, 5000);
// };

// // Handle shutdown signals
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart signal
// process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err);
//   gracefulShutdown('uncaughtException');
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   gracefulShutdown('unhandledRejection');
// });

// // Export for testing or other uses
// export { app, server, io };

//
//
//
////////// If port busy then kill the existing process and run my server //////////
//
//
//
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Game from './models/Game';
import { Chess } from 'chess.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'dev' 
      ? ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000']
      : ['https://yourdomain.com'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Socket.IO blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Chess server is running!');
});

// API Routes
import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);

// Track all socket connections for proper cleanup
const connections = new Set<any>();

// In-memory store for online users { userId: { id: string, name: string, socketId: string } }
const onlineUsers = new Map<string, { id: string; name: string; socketId: string }>();

// Define a type for the socket that includes our custom user property
interface SocketWithAuth extends Socket {
  user?: { id: string; name: string };
}

// Socket.IO middleware for JWT authentication
io.use((socket: SocketWithAuth, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; name: string };
    socket.user = { id: decoded.id, name: decoded.name }; // Attach user info to the socket
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket: SocketWithAuth) => {
  connections.add(socket);
  console.log(`A user connected: ${socket.id}`);

  // User is authenticated via middleware, add them to online list
  if (socket.user) {
    const { id, name } = socket.user;
    onlineUsers.set(id, { id, name, socketId: socket.id });
    console.log(`User ${id} (${name}) is online with socket ${socket.id}`);
    // Broadcast updated online users list to all clients (without socketId)
    const usersForClient = Array.from(onlineUsers.values()).map(({ id, name }) => ({ id, name }));
    io.emit('online_users_updated', usersForClient);
  }

  socket.on('disconnect', () => {
    connections.delete(socket);
    console.log(`User disconnected: ${socket.id}`);
    // On disconnect, remove the user from the online list if they were authenticated
    if (socket.user) {
      const { id, name } = socket.user;
      if (onlineUsers.has(id)) {
        onlineUsers.delete(id);
        console.log(`User ${id} (${name}) went offline`);
        // Broadcast updated online users list to all clients (without socketId)
        const usersForClient = Array.from(onlineUsers.values()).map(({ id, name }) => ({ id, name }));
        io.emit('online_users_updated', usersForClient);
      }
    }
  });

  socket.on('send_challenge', async ({ challengedUserId }) => {
    if (!socket.user) return;

    try {
      // Create a new game with pending status
      // For now, challenger is white, challenged is black. Can be randomized later.
      const game = await Game.create({
        whitePlayer: socket.user.id,
        blackPlayer: challengedUserId,
      });

      // Notify the challenged user
      const challengedSocket = onlineUsers.get(challengedUserId);

      if (!challengedSocket) {
        console.log(`Challenge failed: User ${challengedUserId} is not online.`);
        // Optionally, emit an event back to the challenger that the user is offline
        socket.emit('challenge_failed', { message: 'User is not online.' });
        return;
      }

      io.to(challengedSocket.socketId).emit('new_challenge', {
        gameId: game._id,
        challenger: { id: socket.user.id, name: socket.user.name },
      });

      console.log(`User ${socket.user.name} challenged ${challengedUserId}. Game ID: ${game._id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('challenge_failed', { message: 'Failed to create game.' });
    }
  });

  socket.on('accept_challenge', async ({ gameId }) => {
    try {
      let game = await Game.findById(gameId);
      if (!game) {
        // Game not found
        return;
      }

      const chess = new Chess();

      game.status = 'active';
      game.fen = chess.fen();
      game.turn = chess.turn();
      await game.save();

      // Notify both players that the game has started
      const populatedGame = await game.populate(['whitePlayer', 'blackPlayer']);
      const playerIds = [populatedGame.whitePlayer._id, populatedGame.blackPlayer._id];

      playerIds.forEach(playerId => {
        const playerSocket = onlineUsers.get(playerId.toString());
        if (playerSocket) {
          io.to(playerSocket.socketId).emit('game_started', populatedGame);
        }
      });

      console.log(`Game ${gameId} started.`);
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  });

  socket.on('decline_challenge', async ({ gameId }: { gameId: string }) => {
    if (!socket.user) return;

    try {
      const game = await Game.findById(gameId);
      if (!game) {
        return;
      }

      game.status = 'declined';
      await game.save();

      // Notify the challenger that the challenge was declined
      const challengerId = game.whitePlayer.toString(); // Challenger is always white for now
      const challengerSocket = onlineUsers.get(challengerId);
      if (challengerSocket) {
        io.to(challengerSocket.socketId).emit('challenge_declined', { gameId });
      }

      console.log(`Game ${gameId} declined.`);
    } catch (error) {
      console.error('Error declining challenge:', error);
    }
  });

  socket.on('make_move', async ({ gameId, move }) => {
    if (!socket.user) return;

    try {
      const game = await Game.findById(gameId);
      if (!game || game.status !== 'active') {
        // Game not found or not active
        return;
      }

      // Validate that it's the player's turn
      const isPlayerTurn = (game.turn === 'w' && game.whitePlayer.equals(socket.user.id)) || (game.turn === 'b' && game.blackPlayer.equals(socket.user.id));

      if (!isPlayerTurn) {
        socket.emit('invalid_move', { message: 'Not your turn.' });
        return;
      }

      const chess = new Chess(game.fen);
      const result = chess.move(move);

      if (result) {
        // Move is valid, update game state
        game.fen = chess.fen();
        game.turn = chess.turn();
        // TODO: Add last move details
        await game.save();

        // Broadcast the updated game state to both players
        const populatedGame = await game.populate(['whitePlayer', 'blackPlayer']);
        const playerIds = [populatedGame.whitePlayer._id, populatedGame.blackPlayer._id];

        playerIds.forEach(playerId => {
          const playerSocket = onlineUsers.get(playerId.toString());
          if (playerSocket) {
            io.to(playerSocket.socketId).emit('game_updated', populatedGame);
          }
        });

        // Check for game over
        if (chess.isGameOver()) {
          game.status = 'completed';
          // TODO: Determine winner
          await game.save();
          // TODO: Emit game_over event
        }

      } else {
        // Move is invalid
        socket.emit('invalid_move', { message: 'Invalid move.' });
      }
    } catch (error) {
      console.error('Error making move:', error);
    }
  });
});

const PORT = process.env.PORT || 4000;

// Function to kill process on port and start server
const killPortAndStart = (port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    
    // Command to find and kill process on port
    const killCommand = process.platform === 'win32' 
      ? `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`
      : `lsof -ti:${port} | xargs kill -9`;
    
    console.log(`Checking if port ${port} is in use...`);
    
    exec(killCommand, (error: any, _stdout: string, stderr: string) => {
      if (error) {
        // If no process found on port, that's fine
        if (error.code === 1 || stderr.includes('No such process')) {
          console.log(`Port ${port} is available`);
          resolve();
        } else {
          console.log(`Port ${port} is available (no process found)`);
          resolve();
        }
      } else {
        console.log(`Killed existing process on port ${port}`);
        // Wait a moment for the port to be freed
        setTimeout(() => resolve(), 1000);
      }
    });
  });
};

// Start server with port conflict handling
let serverInstance: any;

const startServer = async () => {
  try {
    const desiredPort = Number(PORT);
    
    // Kill any existing process on the desired port
    await killPortAndStart(desiredPort);
    
    serverInstance = server.listen(desiredPort, () => {
      console.log(`Server is running on port ${desiredPort}`);
    });
    
    // Handle server errors after successful start
    serverInstance.on('error', (err: any) => {
      console.error('Server error:', err);
      gracefulShutdown('serverError');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown function
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  
  // Close all socket connections
  connections.forEach((socket: any) => {
    socket.disconnect(true);
  });
  connections.clear();
  
  // Close Socket.IO server
  io.close(() => {
    console.log('Socket.IO server closed');
    
    // Close HTTP server if it exists
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart signal
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Export for testing or other uses
export { app, server, io };