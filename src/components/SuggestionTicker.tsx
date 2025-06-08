// src/components/SuggestionTicker.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHasMounted } from '@/hooks/useHasMounted';

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
    setIsVisible(false); // Hide while loading new suggestions

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
        let errorDetail = "Unknown API error";
        if (data && typeof data === 'object') {
            if (data.error) {
                errorDetail = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            } else { 
                errorDetail = `API responded with unexpected data format: ${JSON.stringify(data)}`;
            }
        } else if (data) { 
            errorDetail = `API responded with non-object data: ${String(data)}`;
        } else if(res.statusText) { 
            errorDetail = `API responded with status ${res.status}: ${res.statusText}`;
        }
        
        const finalErrorDetailString = String(errorDetail);
        console.error("Failed to load suggestions:", finalErrorDetailString); // Use multi-arg
        setSuggestions([]);
        setIsVisible(false);
      } else {
         setSuggestions([]);
         setIsVisible(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Exception during suggestion loading:", errorMessage); // Use multi-arg
      setSuggestions([]);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Add isLoading to dependencies

  useEffect(() => {
    if (!hasMounted) return;

    const handleLoadSuggestionsEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        loadSuggestions(customEvent.detail);
      }
    };

    window.addEventListener('load-suggestions', handleLoadSuggestionsEvent);
    return () => {
      window.removeEventListener('load-suggestions', handleLoadSuggestionsEvent);
    };
  }, [hasMounted, loadSuggestions]);

  useEffect(() => {
    if (!hasMounted || suggestions.length === 0) {
        if(isVisible) setIsVisible(false); // Ensure it's hidden if suggestions are cleared
        return;
    }
    
    // If suggestions are present, but not currently visible, make the first one visible.
    if (!isVisible && suggestions.length > 0) {
        setIsVisible(true);
    }

    const visibilityTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    const cycleTimer = setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % suggestions.length;
        setIsVisible(true); 
        return nextIndex;
      });
    }, 7000); 

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(cycleTimer);
    };
  }, [currentIndex, suggestions, isVisible, hasMounted]);


  if (!hasMounted || (suggestions.length === 0 && !isLoading)) {
    return isLoading ? <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Carregando sugestões...</div> : null;
  }
  if (suggestions.length === 0 && isLoading) { 
    return <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Carregando sugestões...</div>;
  }

  return (
    <div className="h-20 relative overflow-hidden my-2">
      <AnimatePresence mode="wait">
        {isVisible && suggestions.length > 0 && suggestions[currentIndex] && (
          <motion.div
            key={currentIndex}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="absolute inset-0 bg-card border border-border p-3 rounded-lg flex items-center justify-between shadow-md"
          >
            <div className="flex items-center overflow-hidden mr-2">
              <Lightbulb className="text-yellow-400 mr-3 flex-shrink-0 h-5 w-5" />
              <div className="flex-grow overflow-hidden">
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
