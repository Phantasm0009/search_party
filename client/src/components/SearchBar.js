import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, X } from 'lucide-react';
import { performSearch, getSearchSuggestions } from '../utils/searchApi';

/**
 * Search bar component for entering search queries with suggestions
 */
const SearchBar = ({ onSearch, disabled = false }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced suggestions
  useEffect(() => {
    if (query.length > 1 && !isSearching) {
      const timer = setTimeout(async () => {
        try {
          const suggestions = await getSearchSuggestions(query);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [query, isSearching]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e, searchQuery = null) => {
    e.preventDefault();
    
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim() || isSearching || disabled) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      // Use the new search API instead of mock results
      const results = await performSearch(finalQuery);
      
      onSearch(finalQuery.trim(), results);
      setQuery('');
      setSuggestions([]);
    } catch (error) {
      console.error('Search error:', error);
      // Show user-friendly error message
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestion >= 0) {
          e.preventDefault();
          const selectedQuery = suggestions[selectedSuggestion];
          setQuery(selectedQuery);
          handleSubmit(e, selectedQuery);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
      default:
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Auto-submit when clicking a suggestion
    const fakeEvent = { preventDefault: () => {} };
    handleSubmit(fakeEvent, suggestion);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search the web together..."
            disabled={disabled || isSearching}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          
          {/* Clear button */}
          {query && !isSearching && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute inset-y-0 right-16 pr-3 flex items-center hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          <button
            type="submit"
            disabled={!query.trim() || isSearching || disabled}
            className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              {isSearching ? 'Searching...' : 'Search'}
            </div>
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                index === selectedSuggestion
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {disabled && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Not connected to server. Please wait...
        </p>
      )}
    </div>
  );
};

export default SearchBar;
