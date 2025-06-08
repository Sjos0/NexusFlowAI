// src/components/SuggestionTicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Using ShadCN Button

export interface Suggestion {
  title: string;
  prompt: string;
}

interface SuggestionTickerProps {
  suggestions: Suggestion[];
  onUseSuggestion: (prompt: string) => void;
  isLoading?: boolean; // Optional prop to indicate loading state from parent
}

export function SuggestionTicker({ suggestions, onUseSuggestion, isLoading }: SuggestionTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading || !suggestions || suggestions.length === 0) {
      setIsVisible(false); // Hide if loading or no suggestions
      return;
    }

    // Reset currentIndex if suggestions array changes to avoid out-of-bounds
    if (currentIndex >= suggestions.length) {
      setCurrentIndex(0);
    }
    
    // Make the first (or current) suggestion visible
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Short delay to allow re-render if suggestions changed

    const visibilityTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // Visible for 6 seconds

    const cycleTimer = setTimeout(() => {
      // Ensure suggestions still exist before trying to cycle
      if (suggestions && suggestions.length > 0) {
         setCurrentIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
      }
    }, 7000); // Change suggestion every 7 seconds (6s visible + 1s transition)

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(visibilityTimer);
      clearTimeout(cycleTimer);
    };
  }, [currentIndex, suggestions, isLoading]);


  if (isLoading) {
    return <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Carregando sugestões...</div>;
  }

  if (!suggestions || suggestions.length === 0) {
    return <div className="h-20" />; // Keep layout consistent when no suggestions
  }
  
  const currentSuggestion = suggestions[currentIndex];
  
  // Safety check, though useEffect above should handle currentIndex reset
  if (!currentSuggestion) {
      return <div className="h-20" />;
  }

  return (
    <div className="h-20 relative overflow-hidden my-2">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentIndex} // Ensure key changes for AnimatePresence to work on content change
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="absolute inset-0 bg-card border border-border p-3 rounded-lg flex items-center justify-between shadow-md"
          >
            <div className="flex items-center overflow-hidden mr-2">
              <Lightbulb className="text-yellow-400 mr-3 flex-shrink-0 h-5 w-5" />
              <div className="flex-grow overflow-hidden">
                <h4 className="font-semibold text-sm text-foreground truncate">{currentSuggestion.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentSuggestion.prompt}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onUseSuggestion(currentSuggestion.prompt)}
              className="bg-gradient-to-r from-accent to-accent-end text-accent-foreground font-semibold py-1 px-3 rounded-md ml-auto whitespace-nowrap flex-shrink-0"
            >
              Usar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
