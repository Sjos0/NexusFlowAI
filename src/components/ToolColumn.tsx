// src/components/ToolColumn.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ToolColumnProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  onAdd: () => void;
  accentColor: string;
}

const ToolColumnComponent = ({ title, icon: Icon, children, onAdd, accentColor }: ToolColumnProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col bg-background rounded-lg border-t-4 shadow-md" style={{ borderColor: accentColor }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center">
          <Icon className="h-6 w-6 mr-3" style={{ color: accentColor }} />
          <h2 className="font-headline text-xl font-semibold" style={{ color: accentColor }}>{title}</h2>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } },
              collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } }
            }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              <div className="flex-grow space-y-3 min-h-[50px]"> {/* min-h to prevent complete collapse if children are empty initially */}
                {children}
              </div>
              <Button
                onClick={onAdd}
                className="w-full font-semibold"
                style={{ backgroundColor: accentColor, color: 'hsl(var(--primary-foreground))' }} 
              >
                Adicionar Ferramenta
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ToolColumn = memo(ToolColumnComponent);
