const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true  // Allow same origin in production
      : (process.env.CLIENT_URL || "http://localhost:3000"),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow same origin in production
    : (process.env.CLIENT_URL || "http://localhost:3000"),
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// In-memory storage (replace with database in production)
const rooms = new Map();
const userSessions = new Map();

/**
 * Room data structure:
 * {
 *   id: string,
 *   name: string,
 *   createdAt: Date,
 *   users: Map<socketId, {id, nickname, avatar, joinedAt}>,
 *   searches: Array<{id, userId, query, timestamp, results: Array<{url, title, snippet, votes}>, clicks: Array<{url, timestamp}>}>,
 *   messages: Array<{id, userId, message, timestamp}>,
 *   votes: Map<searchId_resultUrl, {up: Set<userId>, down: Set<userId>}>,
 *   sharedBrowsing: {
 *     enabled: boolean,
 *     currentUrl: string,
 *     currentTitle: string,
 *     lastNavigatedBy: {userId, nickname, timestamp},
 *     scrollPosition: {x: number, y: number},
 *     userScrollPositions: Map<userId, {x: number, y: number}>
 *   }
 * }
 */

// Helper functions
function createRoom(name) {
  const room = {
    id: uuidv4(),
    name: name || 'Untitled Room',
    createdAt: new Date(),
    users: new Map(),
    searches: [],
    messages: [],
    votes: new Map(),
    sharedBrowsing: {
      enabled: true, // Default to shared browsing enabled
      currentUrl: null,
      currentTitle: null,
      lastNavigatedBy: null,
      scrollPosition: { x: 0, y: 0 },
      userScrollPositions: new Map()
    }
  };
  rooms.set(room.id, room);
  return room;
}

function getRoomSummary(room) {
  return {
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    userCount: room.users.size,
    searchCount: room.searches.length,
    messageCount: room.messages.length,
    sharedBrowsing: {
      enabled: room.sharedBrowsing.enabled,
      currentUrl: room.sharedBrowsing.currentUrl,
      currentTitle: room.sharedBrowsing.currentTitle,
      lastNavigatedBy: room.sharedBrowsing.lastNavigatedBy
    }
  };
}

function getTopResults(room, limit = 10) {
  const resultVotes = new Map();
  
  // Aggregate votes for all results
  room.searches.forEach(search => {
    if (search.results) {
      search.results.forEach(result => {
        const key = `${search.id}_${result.url}`;
        const votes = room.votes.get(key);
        if (votes) {
          const score = votes.up.size - votes.down.size;
          resultVotes.set(result.url, {
            ...result,
            score,
            upvotes: votes.up.size,
            downvotes: votes.down.size,
            searchId: search.id,
            query: search.query
          });
        }
      });
    }
  });
  
  // Sort by score and return top results
  return Array.from(resultVotes.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  const room = createRoom(name);
  res.json(getRoomSummary(room));
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    ...getRoomSummary(room),
    topResults: getTopResults(room)
  });
});

// Search API endpoint (proxies to Google Custom Search)
app.post('/api/search', async (req, res) => {
  try {
    const { query, start = 1, num = 10 } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check if Google Search API is configured
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !engineId) {
      return res.status(501).json({ 
        error: 'Search API not configured',
        message: 'Google Custom Search API credentials not found'
      });
    }

    const params = new URLSearchParams({
      key: apiKey,
      cx: engineId,
      q: query.trim(),
      start: start.toString(),
      num: Math.min(num, 10).toString(), // Limit to 10 results max
      safe: 'active',
      lr: 'lang_en'
    });

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results = data.items ? data.items.map((item, index) => ({
      id: `${Date.now()}_${index}`,
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl,
      image: item.pagemap?.cse_image?.[0]?.src,
      upvotes: 0,
      downvotes: 0,
      userVote: null
    })) : [];

    res.json({
      query: query.trim(),
      results,
      totalResults: data.searchInformation?.totalResults || '0',
      searchTime: data.searchInformation?.searchTime || '0'
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

// Serve static files from React build (production only)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // Development - just serve a simple message for non-API routes
  app.get('*', (req, res) => {
    res.json({ 
      message: 'Search Party API Server', 
      env: 'development',
      frontend: 'http://localhost:3000' 
    });
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Reduced logging - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`User connected: ${socket.id}`);
  }
  
  // Join a room
  socket.on('join_room', (data) => {
    try {
      const { roomId, user } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Check if user is already in room to prevent spam
      const existingUser = Array.from(room.users.values()).find(u => u.id === user.id);
      if (existingUser) {
        // Update socket ID for existing user
        room.users.delete(existingUser.socketId);
        existingUser.socketId = socket.id;
        room.users.set(socket.id, existingUser);
        userSessions.set(socket.id, { roomId, userData: existingUser });
        socket.join(roomId);
        
        // Send room data without spamming notifications
        socket.emit('room_joined', {
          room: getRoomSummary(room),
          user: existingUser,
          users: Array.from(room.users.values()),
          searches: room.searches,
          messages: room.messages,
          topResults: getTopResults(room)
        });
        return;
      }
      
      // Add new user to room
      const userData = {
        id: user.id || uuidv4(),
        nickname: user.nickname || 'Anonymous',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname || socket.id}`,
        joinedAt: new Date(),
        socketId: socket.id
      };
      
      room.users.set(socket.id, userData);
      userSessions.set(socket.id, { roomId, userData });
      socket.join(roomId);
      
      // Send room data to user
      socket.emit('room_joined', {
        room: getRoomSummary(room),
        user: userData,
        users: Array.from(room.users.values()),
        searches: room.searches,
        messages: room.messages,
        topResults: getTopResults(room)
      });
      
      // Notify other users
      socket.to(roomId).emit('user_joined', userData);
      
      // Only log new user joins, not reconnections
      if (process.env.NODE_ENV === 'development') {
        console.log(`New user ${userData.nickname} joined room ${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle new search
  socket.on('new_search', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room) return;
      
      const search = {
        id: uuidv4(),
        userId: userData.id,
        userNickname: userData.nickname,
        userAvatar: userData.avatar,
        query: data.query,
        timestamp: new Date(),
        results: data.results || [],
        clicks: []
      };
      
      // Initialize votes for results
      if (search.results) {
        search.results.forEach(result => {
          const voteKey = `${search.id}_${result.url}`;
          room.votes.set(voteKey, {
            up: new Set(),
            down: new Set()
          });
        });
      }
      
      room.searches.push(search);
      
      // Broadcast to all users in room
      io.to(roomId).emit('search_added', search);
      io.to(roomId).emit('top_results_updated', getTopResults(room));
      
      // Minimal logging for searches
      if (process.env.NODE_ENV === 'development') {
        console.log(`Search: "${data.query}"`);
      }
    } catch (error) {
      console.error('Error handling new search:', error);
      socket.emit('error', { message: 'Failed to process search' });
    }
  });
  
  // Handle result click
  socket.on('result_click', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room) return;
      
      const search = room.searches.find(s => s.id === data.searchId);
      if (search) {
        search.clicks.push({
          userId: userData.id,
          url: data.url,
          timestamp: new Date()
        });
        
        // If shared browsing is enabled, update the room's shared URL
        if (room.sharedBrowsing.enabled) {
          room.sharedBrowsing.currentUrl = data.url;
          room.sharedBrowsing.currentTitle = data.title || 'Loading...';
          room.sharedBrowsing.lastNavigatedBy = {
            userId: userData.id,
            nickname: userData.nickname,
            timestamp: new Date()
          };
          room.sharedBrowsing.scrollPosition = { x: 0, y: 0 };
          
          // Broadcast shared navigation to all users in the room
          io.to(roomId).emit('shared_navigation', {
            url: data.url,
            title: data.title || 'Loading...',
            navigatedBy: userData.nickname,
            timestamp: new Date(),
            searchId: data.searchId
          });
        } else {
          // Only notify other users about the click activity (not the clicking user)
          socket.to(roomId).emit('user_clicked_link', {
            userId: userData.id,
            userNickname: userData.nickname,
            url: data.url,
            searchId: data.searchId,
            timestamp: new Date()
          });
        }
        
        // Broadcast updated click count to all users
        io.to(roomId).emit('result_clicked', {
          searchId: data.searchId,
          url: data.url,
          clickCount: search.clicks.filter(c => c.url === data.url).length
        });
      }
    } catch (error) {
      console.error('Error handling result click:', error);
    }
  });

  // Handle voting
  socket.on('vote_result', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room) return;
      
      const voteKey = `${data.searchId}_${data.url}`;
      let votes = room.votes.get(voteKey);
      
      // Initialize votes if they don't exist
      if (!votes) {
        votes = { up: new Set(), down: new Set() };
        room.votes.set(voteKey, votes);
      }
      
      // Remove previous vote
      votes.up.delete(userData.id);
      votes.down.delete(userData.id);
      
      // Add new vote
      let userVote = null;
      if (data.type === 'up') {
        votes.up.add(userData.id);
        userVote = 'up';
      } else if (data.type === 'down') {
        votes.down.add(userData.id);
        userVote = 'down';
      }
      
      // Broadcast vote update to all users in room
      io.to(roomId).emit('vote_updated', {
        searchId: data.searchId,
        url: data.url,
        upvotes: votes.up.size,
        downvotes: votes.down.size,
        userId: userData.id,
        voteType: data.type,
        userVote: userVote
      });
      
      // Update top results
      io.to(roomId).emit('top_results_updated', getTopResults(room));
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  });
  
  // Handle chat message
  socket.on('send_message', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room) return;
      
      const message = {
        id: uuidv4(),
        userId: userData.id,
        userNickname: userData.nickname,
        userAvatar: userData.avatar,
        message: data.message,
        timestamp: new Date()
      };
      
      room.messages.push(message);
      
      // Broadcast to all users in room
      io.to(roomId).emit('message_received', message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  // Handle shared browsing toggle
  socket.on('toggle_shared_browsing', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room) return;
      
      room.sharedBrowsing.enabled = data.enabled;
      
      // If disabling shared browsing, clear current URL
      if (!data.enabled) {
        room.sharedBrowsing.currentUrl = null;
        room.sharedBrowsing.currentTitle = null;
        room.sharedBrowsing.lastNavigatedBy = null;
      }
      
      // Broadcast to all users
      io.to(roomId).emit('shared_browsing_toggled', {
        enabled: data.enabled,
        toggledBy: userData.nickname,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling shared browsing toggle:', error);
    }
  });
  
  // Handle shared page scroll
  socket.on('shared_scroll', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room || !room.sharedBrowsing.enabled) return;
      
      // Update room scroll position
      room.sharedBrowsing.scrollPosition = { x: data.x, y: data.y };
      room.sharedBrowsing.userScrollPositions.set(userData.id, { x: data.x, y: data.y });
      
      // Broadcast to other users (not the sender)
      socket.to(roomId).emit('shared_scroll_update', {
        x: data.x,
        y: data.y,
        scrolledBy: userData.nickname,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling shared scroll:', error);
    }
  });
  
  // Handle direct shared navigation (for manual URL entry)
  socket.on('navigate_shared', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room || !room.sharedBrowsing.enabled) return;
      
      room.sharedBrowsing.currentUrl = data.url;
      room.sharedBrowsing.currentTitle = data.title || 'Loading...';
      room.sharedBrowsing.lastNavigatedBy = {
        userId: userData.id,
        nickname: userData.nickname,
        timestamp: new Date()
      };
      room.sharedBrowsing.scrollPosition = { x: 0, y: 0 };
      
      // Broadcast to all users
      io.to(roomId).emit('shared_navigation', {
        url: data.url,
        title: data.title || 'Loading...',
        navigatedBy: userData.nickname,
        timestamp: new Date(),
        isManualNavigation: true
      });
    } catch (error) {
      console.error('Error handling shared navigation:', error);
    }
  });
  
  // Handle iframe state updates (for rich shared browsing)
  socket.on('iframe_state_update', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;
      
      const { roomId, userData } = session;
      const room = rooms.get(roomId);
      if (!room || !room.sharedBrowsing.enabled) return;
      
      // Update shared browsing state
      if (data.title) {
        room.sharedBrowsing.currentTitle = data.title;
      }
      
      // Broadcast iframe state to other users
      socket.to(roomId).emit('iframe_state_received', {
        ...data,
        updatedBy: userData.nickname,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling iframe state update:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        const { roomId, userData } = session;
        const room = rooms.get(roomId);
        
        if (room) {
          room.users.delete(socket.id);
          socket.to(roomId).emit('user_left', userData);
          // Only log departures in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`User ${userData.nickname} left`);
          }
        }
        
        userSessions.delete(socket.id);
      }
      
      // Minimal disconnect logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`User disconnected: ${socket.id.slice(-6)}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Search Party server running on port ${PORT}`);
});
