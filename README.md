# Search Party 🎉

A collaborative web search tool that functions like "Google Docs for Googling." Create search rooms where teams can research topics together, vote on the best results, and chat about their findings in real-time.

## ✨ Features Overview

### 🔍 Core Search Features
- **Real Google Search Integration**: Powered by Google Custom Search Engine API
- **Real-time Search Sharing**: See everyone's searches and results instantly
- **Smart Search Suggestions**: Get autocomplete suggestions as you type
- **Search History**: Browse past searches within each room
- **Result Bookmarking**: Save important links for later reference

### 🤝 Real-time Collaboration
- **Live Shared Search Feed**: Everyone sees what others are searching instantly
- **Shared Frontend Browsing**: Navigate web pages together in real-time
- **User Presence Indicators**: See who's online, typing, or actively searching
- **Anonymous Mode**: Join comfortably without requiring registration
- **Real-time Synchronization**: All actions sync across all participants immediately
- **Activity Tracking**: See when others click links and navigate to new pages

### 🗳️ Voting & Curation System
- **Upvote/Downvote Results**: Highlight the most useful links collaboratively
- **Top Results Feed**: Curated list of highest-voted results
- **Smart Result Ranking**: Results automatically organized by community consensus
- **Vote Notifications**: Get notified when someone votes on results

### 💬 Integrated Communication
- **Built-in Chat Panel**: Real-time messaging for planning and discussion
- **Chat Notifications**: See when new messages arrive
- **Typing Indicators**: Know when someone is typing a message
- **Message History**: Full conversation history preserved in each room

### 📤 Export & Sharing
- **PDF Export**: Generate formatted reports with all searches and top results
- **Markdown Export**: Download clean markdown files for documentation
- **JSON Export**: Raw data export for further processing
- **Room Link Sharing**: Easy one-click room link copying

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **Simple Onboarding**: Interactive tutorial for first-time users
- **Intuitive Interface**: Clean, modern design with React + Tailwind CSS

### 🔔 Smart Notifications
- **Real-time Alerts**: Notifications for votes, new users, messages, and searches
- **Non-intrusive Design**: Elegant toast notifications that don't interrupt workflow
- **Customizable**: Auto-dismiss after 5 seconds or dismiss manually

## 🌐 NEW: Shared Frontend Browsing

**Experience the future of collaborative research** with our new shared browsing feature! When any team member clicks a search result, the page opens in a shared iframe that everyone can view simultaneously.

### Key Benefits
- **Unified Context**: Everyone sees the same content, ensuring aligned discussions
- **Real-time Navigation**: Instant synchronization when someone visits a new page
- **Activity Awareness**: Clear indicators showing who navigated to which pages
- **Flexible Modes**: Toggle between shared and individual browsing as needed
- **Seamless Integration**: Works alongside existing chat, voting, and search features

### How It Works
1. **Search Together**: Find interesting results as usual
2. **Click to Share**: Any search result click opens the page for everyone
3. **Browse Together**: All team members see the same content in real-time
4. **Discuss & Vote**: Continue chatting and voting while browsing shared content
5. **Navigate Freely**: Use manual URL input or toggle to individual browsing

📖 **[Complete Shared Browsing Guide →](./SHARED_BROWSING_GUIDE.md)**

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Google Custom Search Engine API credentials (optional, falls back to mock data)

### Installation

1. **Clone and install dependencies:**
```bash
cd search-party
npm run install-all
```

2. **Configure environment variables:**

Create `.env` files in both `server/` and `client/` directories:

**Server `.env`:**
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GOOGLE_SEARCH_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

**Client `.env`:**
```bash
REACT_APP_GOOGLE_SEARCH_API_KEY=your-google-api-key
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_ENABLE_REAL_SEARCH=true
```

3. **Start development servers:**
```bash
npm run dev
```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🌐 Deployment

### Quick Deploy to DigitalOcean

Deploy your Search Party app to the cloud in minutes:

1. **Create a DigitalOcean droplet** (Ubuntu 22.04, 2GB RAM minimum)
2. **Run the deployment script:**

```powershell
# Windows PowerShell
.\deploy.ps1 -DropletIP YOUR_DROPLET_IP
```

```bash
# Linux/Mac
chmod +x deploy.sh
export DO_DROPLET_IP=YOUR_DROPLET_IP
./deploy.sh
```

3. **Access your app**: `http://YOUR_DROPLET_IP:5000`

📋 **For detailed deployment instructions**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
📋 **For quick deployment steps**: See [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

### Docker Deployment

The app is containerized and ready for production:

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Production Features
- ✅ **Static file serving** for single-server deployment
- ✅ **Health check endpoint** at `/api/health`
- ✅ **Production environment** configuration
- ✅ **Docker containerization** with security best practices
- ✅ **CORS configuration** for production and development
- ✅ **Rate limiting** and security headers

## 🔧 Configuration

### Google Custom Search Setup

The app includes Google Custom Search integration for real web search results:

1. **Try backend search first** (recommended for production - hides API keys)
2. **Fall back to client-side API calls** if backend fails
3. **Use mock results** if API is not configured

#### Getting Google Custom Search API:

1. Go to [Google Custom Search Engine](https://cse.google.com/)
2. Create a new search engine
3. Get your **Search Engine ID** from the setup page
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Enable the **Custom Search API**
6. Create credentials and get your **API Key**

### Search System Features:
- **Real-time suggestions** as you type
- **Keyboard navigation** (arrow keys, enter, escape)
- **Error handling** with graceful fallbacks
- **Rate limiting** to prevent API abuse
- **Secure proxy** through backend to hide API keys

## 🏗️ Project Structure

```
search-party/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main app pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── ...
│   └── public/
├── server/                 # Node.js backend
│   ├── server.js          # Main server file
│   └── package.json
└── package.json           # Root package.json
```

## 🛠️ Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the client for production
- `npm start` - Start the production server
- `npm run install-all` - Install dependencies for both client and server
- `npm test` - Run tests

## 🌐 Architecture

### Frontend (React 18)
- **Modern React**: Hooks, functional components, and context API
- **Tailwind CSS**: Utility-first styling with dark mode support
- **Socket.IO Client**: Real-time communication
- **React Router**: Client-side routing with future flags enabled

### Backend (Node.js + Express)
- **Express Server**: RESTful API endpoints
- **Socket.IO**: WebSocket server for real-time features
- **Rate Limiting**: Protection against API abuse
- **CORS & Helmet**: Security middleware

### Real-time Features
- **WebSocket Connections**: Bidirectional real-time communication
- **Room Management**: Isolated collaboration spaces
- **Live Synchronization**: Instant updates across all participants
- **Presence Tracking**: User online status and activity indicators

## 🔐 Security Features

- **Rate Limiting**: Prevents API abuse and spam
- **CORS Protection**: Restricts cross-origin requests
- **Helmet Security**: Additional security headers
- **API Key Protection**: Backend proxy hides sensitive keys
- **Input Validation**: Sanitized user inputs

## 🎯 Use Cases

- **Research Teams**: Collaborative academic or professional research
- **Content Creation**: Gathering sources for articles or reports
- **Product Discovery**: Team shopping or product research
- **Event Planning**: Finding venues, services, and vendors together
- **Educational**: Students working on group projects
- **Professional**: Marketing teams, consultants, analysts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

---

**Search Party** - Making web research a collaborative experience! 🚀
- **PDF Export**: Generate formatted reports of search sessions
- **Markdown Export**: Download documentation-friendly format
- **JSON Export**: Raw data export for further analysis

### Technical Features
- **Anonymous Mode**: Join with just a nickname, no account required
- **Real-time Sync**: WebSocket connections for instant updates
- **Error Handling**: Robust error handling and reconnection logic
- **Rate Limiting**: Built-in protection against abuse

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - Request throttling
- **UUID** - Unique identifier generation

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with WebSocket support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd search_party
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Setup environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   cd ../client
   npm start
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating a Room
1. Visit the home page
2. Enter your nickname (optional - will auto-generate if empty)
3. Enter a room name (optional)
4. Click "Create Room"
5. Share the room link with your team

### Joining a Room
1. Get a room link from a teammate OR
2. Use the "Join Room" form with a room ID
3. Enter your nickname
4. Start collaborating!

### Searching Together
1. Use the search bar to enter queries
2. Results appear in real-time for all room members
3. Click on results to open them (tracked for the team)
4. Vote on results using up/down arrows
5. See top-voted results in the "Top Results" panel

### Using Chat
1. Switch to the "Chat" panel
2. Type messages to communicate with your team
3. Messages appear instantly for all members

### Exporting Results
1. Go to the "Export" panel
2. Choose your preferred format (PDF, Markdown, JSON)
3. Download your collaborative research session

## Development

### Project Structure
```
search_party/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   └── package.json
├── server/                # Node.js backend
│   ├── server.js         # Main server file
│   ├── .env.example      # Environment variables template
│   └── package.json
└── README.md
```

### Key Components

#### Frontend Components
- **Home**: Landing page with room creation/joining
- **Room**: Main collaboration interface
- **SearchBar**: Query input with real-time search
- **SearchResults**: Display search results with voting
- **ChatPanel**: Real-time messaging
- **UserList**: Show room members
- **TopResults**: Curated best results
- **ExportPanel**: Data export functionality

#### Backend Features
- **Room Management**: Create/join/leave rooms
- **Real-time Events**: Search sharing, voting, chat
- **Data Storage**: In-memory storage (easily replaceable)
- **Rate Limiting**: Prevent abuse
- **Error Handling**: Graceful error management

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Google Custom Search API (for real web search)
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

Create a `.env` file in the client directory:

```env
# Google Custom Search API Configuration
REACT_APP_GOOGLE_SEARCH_API_KEY=your-google-search-api-key
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# Backend API URL
REACT_APP_SERVER_URL=http://localhost:5000

# Feature flags
REACT_APP_ENABLE_REAL_SEARCH=true
```

### Setting Up Real Search (Google Custom Search)

1. **Create a Google Custom Search Engine**:
   - Go to [Google Custom Search](https://cse.google.com/)
   - Click "Add" to create a new search engine
   - Enter `*` in "Sites to search" to search the entire web
   - Get your Search Engine ID from the setup page

2. **Get Google API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Custom Search API"
   - Create credentials (API Key)
   - Copy the API key

3. **Configure Environment Variables**:
   - Add your API key and Search Engine ID to both `.env` files
   - The app will automatically use real search when configured
   - Falls back to mock results if API is not configured

### Available Scripts

#### Backend (server/)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Frontend (client/)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Or deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

### Backend Deployment (Heroku/Railway)

1. **Deploy to Heroku**
   ```bash
   cd server
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Deploy
   heroku create your-app-name
   git push heroku main
   ```

2. **Update environment variables**
   Set `CLIENT_URL` to your frontend URL

### Full-Stack Deployment

For a complete deployment, you can use:
- **Frontend**: Vercel/Netlify
- **Backend**: Heroku/Railway/DigitalOcean
- **Database**: MongoDB Atlas (when adding persistence)

## Customization

### Adding Real Search APIs

Replace the mock search in `client/src/utils/helpers.js`:

```javascript
// Replace mockSearchResults with real API calls
export const performSearch = async (query) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
};
```

### Adding User Authentication

1. Add authentication middleware to the backend
2. Implement login/signup components
3. Store user sessions and preferences
4. Add user management features

### Adding Database Persistence

1. Choose a database (MongoDB, PostgreSQL, etc.)
2. Replace in-memory storage in `server.js`
3. Add data models and migrations
4. Implement data persistence for rooms, searches, and users

### Extending Functionality

- **File Sharing**: Upload and share documents
- **Screen Sharing**: Video collaboration features
- **Search History**: Track user search patterns
- **Room Templates**: Pre-configured room types
- **Advanced Voting**: Multiple vote types and weighting

## 📚 Documentation

### Setup & Usage Guides
- **[Main README](./README.md)** - Complete setup and feature overview
- **[Shared Browsing Guide](./SHARED_BROWSING_GUIDE.md)** - Comprehensive guide to collaborative web browsing
- **[Developer Reference](./DEVELOPER_REFERENCE.md)** - Technical documentation for developers

### Quick References
- **Environment Setup**: See [Installation](#-installation) section above
- **API Configuration**: Google Custom Search setup instructions
- **Feature Testing**: Step-by-step testing procedures for all features
- **Troubleshooting**: Common issues and solutions

### Technical Documentation
- **Socket Events**: Real-time communication protocols
- **Component Architecture**: React component structure and props
- **Database Schema**: Room and user data models
- **Security Features**: CORS, sandboxing, and rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ for collaborative research and discovery.
