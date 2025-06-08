// src/components/VariableColumn.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { VariableCard } from './VariableCard';
import { Variable } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, memo } from 'react';
import { ChevronDown } from 'lucide-react';

interface VariableColumnProps {
  title: string;
  icon: LucideIcon;
  accentColor: string;
  variables: Variable[];
  onAdd: () => void;
  onEdit: (variable: Variable) => void;
  onDelete: (variableId: string, variableName: string) => void;
}

const VariableColumnComponent = ({ title, icon: Icon, accentColor, variables, onAdd, onEdit, onDelete }: VariableColumnProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col bg-background rounded-lg border-t-4 shadow-md" style={{ borderColor: accentColor }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-variables`}
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
            id={`collapsible-content-variables`}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } },
              collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } }
            }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              <ScrollArea className="flex-grow mb-3 pr-1 -mr-1 max-h-[calc(100vh-20rem)] min-h-[100px]"> {/* Adjust max-h as needed */}
                <div className="space-y-3">
                  {variables.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm text-muted-foreground text-center py-4"
                    >
                      Sem {title.toLowerCase()} definidas.
                    </motion.p>
                  )}
                  <AnimatePresence>
                    {variables.map(variable => (
                      <motion.div
                        key={variable.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.2 }}
                      >
                        <VariableCard
                          variable={variable}
                          onEdit={() => onEdit(variable)}
                          onDelete={() => onDelete(variable.id, variable.name)}
                          accentColor={accentColor}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
              <Button
                onClick={onAdd}
                className="mt-auto w-full font-semibold"
                style={{ backgroundColor: accentColor, color: 'hsl(var(--primary-foreground))' }}
              >
                Adicionar Variável
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
export const VariableColumn = memo(VariableColumnComponent);
