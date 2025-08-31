import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';

/**
 * Chat panel component for real-time messaging
 */
const ChatPanel = ({ messages, onSendMessage, currentUser }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smile className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start a conversation with your team
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${
                msg.userId === currentUser?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <img
                src={msg.userAvatar}
                alt={msg.userNickname}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              
              <div className={`flex-1 max-w-xs lg:max-w-md ${
                msg.userId === currentUser?.id ? 'text-right' : ''
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {msg.userId === currentUser?.id ? (
                    <>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        You
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {msg.userNickname}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </>
                  )}
                </div>
                
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  msg.userId === currentUser?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            overflow: 'hidden'
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
