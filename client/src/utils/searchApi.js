/**
 * Search API integration for Search Party
 * Integrates with Google Custom Search Engine and other search providers
 */

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID;

/**
 * Perform search using Google Custom Search API
 */
export const googleCustomSearch = async (query, options = {}) => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    console.warn('Google Search API credentials not configured, using mock results');
    return mockSearchResults(query);
  }

  try {
    const {
      start = 1,
      num = 10,
      safe = 'active',
      lr = 'lang_en'
    } = options;

    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      start: start.toString(),
      num: num.toString(),
      safe,
      lr
    });

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item, index) => ({
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
    }));

  } catch (error) {
    console.error('Google Custom Search error:', error);
    
    // Fallback to mock results if API fails
    console.log('Falling back to mock search results');
    return mockSearchResults(query);
  }
};

/**
 * Perform search using backend proxy (recommended for production)
 */
export const backendSearch = async (query, options = {}) => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Backend search error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];

  } catch (error) {
    console.error('Backend search error:', error);
    
    // Fallback to client-side search
    console.log('Falling back to client-side search');
    return googleCustomSearch(query, options);
  }
};

/**
 * Main search function - tries different search methods in order
 */
export const performSearch = async (query, options = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim();
  
  try {
    // Try backend search first (recommended for production)
    const results = await backendSearch(trimmedQuery, options);
    
    if (results && results.length > 0) {
      return results;
    }
    
    // Fallback to direct API call
    return await googleCustomSearch(trimmedQuery, options);
    
  } catch (error) {
    console.error('All search methods failed:', error);
    
    // Final fallback to mock results
    return mockSearchResults(trimmedQuery);
  }
};

/**
 * Mock search results for development/demo purposes
 */
export const mockSearchResults = (query) => {
  const baseResults = [
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      snippet: `Learn about ${query} from the world's largest encyclopedia. Comprehensive information and reliable sources.`,
      displayLink: 'en.wikipedia.org'
    },
    {
      title: `Best ${query} Guide 2024`,
      url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Complete guide to ${query}. Everything you need to know with expert tips and recommendations.`,
      displayLink: 'example.com'
    },
    {
      title: `${query} - Official Website`,
      url: `https://${query.toLowerCase().replace(/\s+/g, '')}.com`,
      snippet: `Official website for ${query}. Get the latest information, updates, and official resources.`,
      displayLink: `${query.toLowerCase().replace(/\s+/g, '')}.com`
    },
    {
      title: `How to ${query} - Tutorial`,
      url: `https://tutorial.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Step-by-step tutorial on ${query}. Learn from experts with practical examples and tips.`,
      displayLink: 'tutorial.com'
    },
    {
      title: `${query} Reviews and Ratings`,
      url: `https://reviews.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `User reviews and expert ratings for ${query}. Compare options and make informed decisions.`,
      displayLink: 'reviews.com'
    },
    {
      title: `${query} News and Updates`,
      url: `https://news.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Latest news and updates about ${query}. Stay informed with breaking news and trending topics.`,
      displayLink: 'news.com'
    }
  ];

  // Add some randomization to make it feel more realistic
  return baseResults
    .map(result => ({
      ...result,
      id: Math.random().toString(36).substring(7),
      upvotes: 0,
      downvotes: 0,
      userVote: null
    }))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 4); // Return 4-6 results
};

/**
 * Search suggestion/autocomplete function
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  // Note: Google's suggest API blocks CORS requests from localhost
  // For production, implement suggestions through your backend or use a different service
  
  // Simple fallback suggestions for demo purposes
  const commonSuggestions = [
    'wikipedia',
    'github',
    'stack overflow',
    'youtube',
    'reddit',
    'news',
    'weather',
    'translate',
    'calculator',
    'maps'
  ];

  const filtered = commonSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  // Add the current query as first suggestion if it's not empty
  const suggestions = [query, ...filtered].slice(0, 5);
  
  return suggestions;
};

/**
 * Check if a URL is accessible/valid
 */
export const validateSearchResult = async (url) => {
  try {
    await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues for validation
    });
    return true;
  } catch (error) {
    return false;
  }
};
