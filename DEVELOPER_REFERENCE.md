# 🔧 Developer Quick Reference - Shared Browsing

## Socket Events Reference

### Server → Client Events
```javascript
// Shared navigation event
'shared_navigation' = {
  url: string,
  title: string,
  navigatedBy: string,
  timestamp: Date,
  searchId?: string,
  isManualNavigation?: boolean
}

// Shared browsing toggle
'shared_browsing_toggled' = {
  enabled: boolean,
  toggledBy: string,
  timestamp: Date
}

// Scroll synchronization (future)
'shared_scroll_update' = {
  x: number,
  y: number,
  scrolledBy: string,
  timestamp: Date
}

// Iframe state updates
'iframe_state_received' = {
  title?: string,
  updatedBy: string,
  timestamp: Date
}
```

### Client → Server Events
```javascript
// Toggle shared browsing mode
'toggle_shared_browsing' = {
  enabled: boolean
}

// Manual navigation
'navigate_shared' = {
  url: string,
  title?: string
}

// Result click (enhanced)
'result_click' = {
  searchId: string,
  url: string,
  title: string
}

// Scroll position (future)
'shared_scroll' = {
  x: number,
  y: number
}

// Iframe state update
'iframe_state_update' = {
  title?: string
}
```

## Component Props Reference

### SharedBrowser Component
```javascript
<SharedBrowser
  socket={socket}           // Socket.io instance
  on={on}                  // Socket event listener function
  emit={emit}              // Socket event emitter function
  currentUser={user}       // Current user object
  sharedBrowsingState={{   // Shared browsing state
    enabled: boolean,
    currentUrl: string,
    currentTitle: string,
    lastNavigatedBy: object
  }}
  onToggleSharedBrowsing={function} // Toggle handler
/>
```

### Updated SearchResults Component
```javascript
<SearchResults
  searches={searches}
  currentUser={user}
  onVote={handleVote}
  onResultClick={(searchId, url, title) => {}} // Enhanced signature
/>
```

## Database Schema Changes

### Room Model (Enhanced)
```javascript
{
  id: string,
  name: string,
  createdAt: Date,
  users: Map<socketId, UserData>,
  searches: Array<SearchData>,
  messages: Array<MessageData>,
  votes: Map<voteKey, VoteData>,
  
  // NEW: Shared browsing state
  sharedBrowsing: {
    enabled: boolean,
    currentUrl: string | null,
    currentTitle: string | null,
    lastNavigatedBy: {
      userId: string,
      nickname: string,
      timestamp: Date
    } | null,
    scrollPosition: { x: number, y: number },
    userScrollPositions: Map<userId, {x: number, y: number}>
  }
}
```

## API Changes

### Enhanced result_click Handler
```javascript
// OLD
socket.on('result_click', ({ searchId, url }) => {
  // Basic click tracking
});

// NEW
socket.on('result_click', ({ searchId, url, title }) => {
  // Enhanced with title and shared browsing logic
  if (room.sharedBrowsing.enabled) {
    // Update shared state and broadcast
    io.to(roomId).emit('shared_navigation', { url, title, ... });
  }
});
```

## File Structure
```
search_party/
├── server/
│   └── server.js                    (Enhanced with shared browsing)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SharedBrowser.js     (NEW)
│   │   │   ├── SearchResults.js     (Enhanced)
│   │   │   └── TopResults.js        (Enhanced)
│   │   └── pages/
│   │       └── Room.js              (Enhanced)
│   └── public/
└── SHARED_BROWSING_GUIDE.md         (NEW)
```

## Testing Utilities

### Socket Event Testing
```javascript
// Test shared navigation
socket.emit('result_click', {
  searchId: 'test-search-123',
  url: 'https://example.com',
  title: 'Example Page'
});

// Test manual navigation
socket.emit('navigate_shared', {
  url: 'https://wikipedia.org',
  title: 'Wikipedia'
});

// Test toggle
socket.emit('toggle_shared_browsing', {
  enabled: false
});
```

### Component Testing
```javascript
// Test SharedBrowser component
const mockProps = {
  socket: mockSocket,
  on: jest.fn(),
  emit: jest.fn(),
  currentUser: { id: '123', nickname: 'Test User' },
  sharedBrowsingState: {
    enabled: true,
    currentUrl: 'https://example.com',
    currentTitle: 'Test Page',
    lastNavigatedBy: { nickname: 'User1', timestamp: new Date() }
  },
  onToggleSharedBrowsing: jest.fn()
};
```

## Performance Considerations

### Optimization Tips
1. **Debounce scroll events** (when implementing scroll sync)
2. **Cache iframe content** for frequently visited pages
3. **Limit concurrent shared navigations** to prevent conflicts
4. **Use efficient state updates** to minimize re-renders
5. **Implement connection pooling** for large rooms

### Memory Management
- Clean up event listeners on component unmount
- Limit stored scroll positions per user
- Garbage collect old navigation history
- Monitor WebSocket connection health

## Security Checklist

- ✅ Iframe sandbox attributes configured
- ✅ CORS handling for restricted sites
- ✅ XSS prevention in URL handling
- ✅ Rate limiting on navigation events
- ✅ Input validation for manual URLs
- ✅ Secure WebSocket connections (WSS in production)

## Common Patterns

### Event Listener Cleanup
```javascript
useEffect(() => {
  const unsubscribers = [
    on('shared_navigation', handleSharedNavigation),
    on('shared_browsing_toggled', handleToggle)
  ];

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}, [on]);
```

### State Updates
```javascript
// Atomic state updates for shared browsing
setSharedBrowsingState(prev => ({
  ...prev,
  currentUrl: newUrl,
  currentTitle: newTitle,
  lastNavigatedBy: { nickname, timestamp: new Date() }
}));
```

### Error Handling
```javascript
// Graceful iframe error handling
const handleIframeError = useCallback(() => {
  setError('Page could not be loaded due to security restrictions');
  setIsLoading(false);
}, []);
```
