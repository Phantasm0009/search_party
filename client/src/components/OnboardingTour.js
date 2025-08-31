import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Simple onboarding component with tooltips for first-time users
 */
const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      target: '.search-bar',
      title: 'Start Searching',
      description: 'Type your search query here. Everyone in the room will see your results in real-time!',
      position: 'bottom'
    },
    {
      target: '.panel-navigation',
      title: 'Navigate Panels',
      description: 'Switch between different views: Search results, Chat, Users online, Top results, and Export options.',
      position: 'left'
    },
    {
      target: '.vote-buttons',
      title: 'Vote on Results',
      description: 'Upvote or downvote search results to help the team find the most useful information.',
      position: 'top'
    },
    {
      target: '.chat-panel',
      title: 'Team Chat',
      description: 'Discuss findings and coordinate your research with built-in real-time chat.',
      position: 'top'
    },
    {
      target: '.room-link',
      title: 'Share Room',
      description: 'Copy the room link to invite teammates to collaborate on your search.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('search-party-tour-completed');
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000); // Show after 1 second
    }
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('search-party-tour-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour tooltip */}
      <div className="fixed z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentStep + 1}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Skip Tour
            </button>
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to trigger onboarding for new users
 */
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const startOnboarding = () => {
    localStorage.removeItem('search-party-tour-completed');
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    startOnboarding,
    completeOnboarding
  };
};

export default OnboardingTour;
