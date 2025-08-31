/**
 * Utility functions for Search Party app
 */

/**
 * Generate a random nickname for anonymous users
 */
export const generateNickname = () => {
  const adjectives = [
    'Swift', 'Bright', 'Clever', 'Quick', 'Smart', 'Keen', 'Sharp', 'Alert',
    'Wise', 'Bold', 'Fast', 'Agile', 'Brave', 'Cool', 'Epic', 'Wild',
    'Cyber', 'Digital', 'Virtual', 'Tech', 'Web', 'Net', 'Code', 'Data'
  ];
  
  const nouns = [
    'Searcher', 'Explorer', 'Hunter', 'Detective', 'Scholar', 'Researcher',
    'Finder', 'Navigator', 'Scout', 'Investigator', 'Analyst', 'Seeker',
    'Browser', 'Surfer', 'Crawler', 'Spider', 'Bot', 'Agent', 'Query', 'Link'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};

/**
 * Format timestamp to readable format
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (timestamp) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = date - now;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
};

/**
 * Debounce function to limit API calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackErr) {
      console.error('Failed to copy text: ', fallbackErr);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

/**
 * Generate room ID
 */
export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Validate URL
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return url;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate avatar URL using DiceBear API
 */
export const generateAvatarUrl = (seed, style = 'avataaars') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * Simulate web search results (for demo purposes)
 * In production, this would be replaced with actual search API calls
 */
export const mockSearchResults = (query) => {
  const baseResults = [
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      snippet: `Learn about ${query} from the world's largest encyclopedia. Comprehensive information and reliable sources.`
    },
    {
      title: `Best ${query} Guide 2024`,
      url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Complete guide to ${query}. Everything you need to know with expert tips and recommendations.`
    },
    {
      title: `${query} - Official Website`,
      url: `https://${query.toLowerCase().replace(/\s+/g, '')}.com`,
      snippet: `Official website for ${query}. Get the latest information, updates, and official resources.`
    },
    {
      title: `How to ${query} - Tutorial`,
      url: `https://tutorial.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Step-by-step tutorial on ${query}. Learn from experts with practical examples and tips.`
    },
    {
      title: `${query} Reviews and Ratings`,
      url: `https://reviews.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `User reviews and expert ratings for ${query}. Compare options and make informed decisions.`
    }
  ];

  // Add some randomization to make it feel more realistic
  return baseResults
    .map(result => ({
      ...result,
      id: Math.random().toString(36).substring(7)
    }))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 3); // Return 3-5 results
};

/**
 * Local storage helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};
