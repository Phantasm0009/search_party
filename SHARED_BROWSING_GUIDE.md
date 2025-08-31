# 🌐 Search Party - Shared Frontend Browsing Feature

## Overview

The Search Party app now includes **Shared Frontend Browsing**, allowing team members to browse web pages together in real-time. When any user clicks a search result, the page opens in a shared iframe that all participants can view simultaneously.

## 🚀 New Features

### Shared Link Viewing
- **Collaborative Browsing**: When a user clicks a search result, it opens in the frontend for everyone in the party
- **Real-time Synchronization**: All users see the same page content in the shared browser panel
- **Activity Indicators**: Shows who opened each link with timestamps and notifications

### Backend Enhancements
- **WebSocket Events**: New socket events for shared navigation and browsing state
- **Room State Management**: Enhanced room data structure to track shared browsing state
- **User Activity Tracking**: Real-time updates when users navigate to new pages

### Frontend/UI Changes
- **Shared Browser Panel**: New dedicated panel with integrated iframe for shared viewing
- **Navigation Controls**: Manual URL input, external link opening, and browsing toggle
- **Activity Notifications**: In-app notifications when users navigate to new pages
- **Responsive Design**: Maintains responsive layout and dark/light mode support

### UX Features
- **Toggle Control**: Switch between shared browsing and individual browsing modes
- **Error Handling**: Graceful handling of page load failures and CORS restrictions
- **Collaboration Context**: Clear indicators showing who navigated to current page
- **Independent Features**: Chat and voting remain functional during shared browsing

## 🛠 Technical Implementation

### Server-Side Changes (`server/server.js`)

#### Enhanced Room Data Structure
```javascript
sharedBrowsing: {
  enabled: boolean,
  currentUrl: string,
  currentTitle: string,
  lastNavigatedBy: {userId, nickname, timestamp},
  scrollPosition: {x: number, y: number},
  userScrollPositions: Map<userId, {x: number, y: number}>
}
```

#### New Socket Events
- `shared_navigation`: Broadcast when users navigate to new pages
- `shared_browsing_toggled`: Handle enabling/disabling shared browsing
- `shared_scroll`: Synchronize scroll positions (future enhancement)
- `navigate_shared`: Handle manual URL navigation
- `iframe_state_update`: Update iframe title and metadata

### Client-Side Changes

#### New Components
- **`SharedBrowser.js`**: Main shared browsing component with iframe management
- **Enhanced Room State**: Shared browsing state management in Room.js
- **Updated SearchResults**: Modified to pass page titles for shared navigation

#### Updated Event Handling
- Enhanced `result_click` to include page titles
- New shared browsing socket event listeners
- Auto-switching to shared browser panel when navigation occurs

## 📋 Setup Instructions

### Prerequisites
- Node.js (16+)
- npm (7+)
- Google Custom Search API key (optional, mock data available)

### Installation

1. **Clone/Navigate to Project**
   ```bash
   cd search_party
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   **Server (.env)**:
   ```bash
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   GOOGLE_SEARCH_API_KEY=your-api-key
   GOOGLE_SEARCH_ENGINE_ID=your-engine-id
   ```
   
   **Client (.env)**:
   ```bash
   REACT_APP_GOOGLE_SEARCH_API_KEY=your-api-key
   REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your-engine-id
   REACT_APP_SERVER_URL=http://localhost:5000
   REACT_APP_ENABLE_REAL_SEARCH=true
   ```

4. **Start Development Servers**
   ```bash
   # Option 1: Start both servers concurrently
   npm run dev
   
   # Option 2: Start separately
   # Terminal 1 - Server
   cd server && npm start
   
   # Terminal 2 - Client
   cd client && npm start
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🧪 Testing Shared Browsing

### Basic Testing
1. **Create a Room**: Go to http://localhost:3000 and create a new room
2. **Open Multiple Tabs**: Open the room link in 2+ browser tabs/windows
3. **Perform Search**: Search for something in one tab (e.g., "wikipedia")
4. **Click a Result**: Click on any search result
5. **Verify Shared View**: All tabs should show the same page in the "Shared Browser" panel

### Advanced Testing
1. **Toggle Shared Browsing**: Use the eye icon to disable/enable shared browsing
2. **Manual Navigation**: Use the home icon to navigate to custom URLs
3. **External Links**: Click the external link icon to open pages in new tabs
4. **Activity Tracking**: Watch for notifications when other users navigate
5. **Cross-Browser**: Test with different users in different browsers

### Expected Behavior
- ✅ Shared navigation updates all connected users in real-time
- ✅ Activity notifications appear when others navigate
- ✅ Auto-switch to shared browser panel when navigation occurs
- ✅ Toggle between shared and individual browsing modes
- ✅ Chat and voting work independently of shared browsing
- ✅ Error handling for pages that can't be embedded

## 🔧 Configuration Options

### Shared Browsing Settings
```javascript
// Default settings in room creation
sharedBrowsing: {
  enabled: true,  // Enable by default
  currentUrl: null,
  currentTitle: null,
  lastNavigatedBy: null
}
```

### Security Considerations
- **CORS Restrictions**: Some sites (banks, social media) cannot be embedded in iframes
- **Sandbox Attributes**: Iframes use security sandbox for safe content loading
- **Content Security**: No JavaScript execution from embedded pages in shared context

## 🐛 Troubleshooting

### Common Issues

**Issue**: Page won't load in shared browser
- **Cause**: CORS/X-Frame-Options restrictions
- **Solution**: Open in external tab (external link button)

**Issue**: Shared browsing not working
- **Cause**: WebSocket connection issues
- **Solution**: Check server logs, refresh browser, verify server is running

**Issue**: Multiple navigation events
- **Cause**: Multiple clicks or fast navigation
- **Solution**: Events are debounced, normal behavior

**Issue**: Scroll synchronization not working
- **Cause**: Feature is prepared but not fully implemented
- **Solution**: Basic navigation sync works, scroll sync is future enhancement

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

Check browser console and server logs for detailed information.

## 🔮 Future Enhancements

### Planned Features
1. **Scroll Synchronization**: Real-time scroll position sharing
2. **Drawing/Annotation**: Collaborative markup on shared pages
3. **Page Interaction Sync**: Synchronized form filling and clicks
4. **Session Recording**: Save and replay browsing sessions
5. **Presentation Mode**: One user controls, others follow
6. **Mobile Optimization**: Enhanced mobile shared browsing experience

### Performance Optimizations
1. **Iframe Caching**: Cache frequently accessed pages
2. **Connection Management**: Optimize WebSocket connection handling
3. **State Compression**: Reduce data transfer for large rooms
4. **Progressive Loading**: Lazy load iframe content

## 📱 Mobile Support

The shared browsing feature is fully responsive and works on mobile devices with the following considerations:
- Touch gestures work within iframes
- Mobile-optimized iframe sizing
- Responsive panel layout
- Touch-friendly navigation controls

## 🔒 Security Features

- **Content Sandboxing**: Embedded pages run in secure sandbox
- **No Script Execution**: JavaScript from embedded pages is isolated
- **HTTPS Enforcement**: Secure connections for production deployment
- **Rate Limiting**: Protected against abuse and excessive requests

## 📊 Analytics & Monitoring

Track shared browsing usage:
- Navigation events per room
- Most visited shared pages
- User engagement with shared content
- Error rates for different domains

---

## 🎉 Conclusion

The shared frontend browsing feature transforms Search Party from a collaborative search tool into a comprehensive team browsing platform. Users can now research topics together, discuss findings in real-time, and maintain context while exploring web content as a unified team.

For technical support or feature requests, please refer to the main README.md or create an issue in the project repository.
