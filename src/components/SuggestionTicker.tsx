// src/components/SuggestionTicker.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Using ShadCN Button
import { useHasMounted } from '@/hooks/useHasMounted'; // To prevent hydration issues with window

interface Suggestion {
  title: string;
  prompt: string;
}

interface SuggestionTickerProps {
  onUseSuggestion: (prompt: string) => void;
}

export function SuggestionTicker({ onUseSuggestion }: SuggestionTickerProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasMounted = useHasMounted();

  const loadSuggestions = useCallback(async (tools: any) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
        setCurrentIndex(0);
        setIsVisible(true); // Make first suggestion visible immediately after loading
      } else if (!res.ok) {
        console.error("Failed to load suggestions:", data.error || "Unknown API error");
        setSuggestions([]);
      } else {
         setSuggestions([]); // API returned ok but no valid data
      }
    } catch (error) {
      console.error("Failed to load suggestions", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Add isLoading to dependencies

  // Effect for event listener
  useEffect(() => {
    if (!hasMounted) return; // Ensure window is available

    const handleLoadSuggestions = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        loadSuggestions(customEvent.detail);
      }
    };

    window.addEventListener('load-suggestions', handleLoadSuggestions);
    return () => {
      window.removeEventListener('load-suggestions', handleLoadSuggestions);
    };
  }, [hasMounted, loadSuggestions]);

  // The animation cycle effect
  useEffect(() => {
    if (!hasMounted || suggestions.length === 0 || !isVisible) return;

    // This timer handles making the current item INVISIBLE after 6 seconds
    const visibilityTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // Visible for 6 seconds

    // This timer handles changing to the NEXT item after 7 seconds
    // (6s visible + 1s for exit/enter animation)
    // It will then set isVisible to true for the new item
    const cycleTimer = setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % suggestions.length;
        // Make the *next* item visible
        // The AnimatePresence key change will trigger the animation
        setIsVisible(true); 
        return nextIndex;
      });
    }, 7000); 

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(cycleTimer);
    };
  }, [currentIndex, suggestions, isVisible, hasMounted]);


  if (!hasMounted || suggestions.length === 0 && !isLoading) {
    // Optionally, show a loading state or nothing if not loading and no suggestions
    return isLoading ? <div className="h-20 flex items-center justify-center text-muted-foreground">Carregando sugestões...</div> : null;
  }
  if (suggestions.length === 0 && isLoading) {
    return <div className="h-20 flex items-center justify-center text-muted-foreground">Carregando sugestões...</div>;
  }


  return (
    <div className="h-20 relative overflow-hidden my-2"> {/* Added my-2 for spacing */}
      <AnimatePresence mode="wait"> {/* mode="wait" can help with smoother transitions */}
        {isVisible && suggestions[currentIndex] && (
          <motion.div
            key={currentIndex} // Key change triggers enter/exit
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="absolute inset-0 bg-card border border-border p-3 rounded-lg flex items-center justify-between shadow-md"
          >
            <div className="flex items-center overflow-hidden mr-2"> {/* Added overflow-hidden and mr-2 */}
              <Lightbulb className="text-yellow-400 mr-3 flex-shrink-0 h-5 w-5" />
              <div className="flex-grow overflow-hidden"> {/* Added flex-grow and overflow-hidden */}
                <h4 className="font-semibold text-sm text-foreground truncate">{suggestions[currentIndex].title}</h4>
                <p className="text-xs text-muted-foreground truncate">{suggestions[currentIndex].prompt}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onUseSuggestion(suggestions[currentIndex].prompt)}
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
