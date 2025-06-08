// src/components/VariableColumn.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { VariableCard } from './VariableCard';
import { Variable } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VariableColumnProps {
  title: string;
  icon: LucideIcon;
  accentColor: string;
  variables: Variable[];
  onAdd: () => void;
  onEdit: (variable: Variable) => void;
  onDelete: (variableId: string, variableName: string) => void;
}

export function VariableColumn({ title, icon: Icon, accentColor, variables, onAdd, onEdit, onDelete }: VariableColumnProps) {
  return (
    <div className="flex flex-col bg-card rounded-lg p-4 w-full h-full shadow-md border-border">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 mr-3" style={{ color: accentColor }} />
        <h2 className="font-headline text-xl font-semibold" style={{ color: accentColor }}>{title}</h2>
      </div>
      <ScrollArea className="flex-grow mb-3 pr-1 -mr-1">
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
        className="mt-auto w-full font-bold" // mt-auto to push to bottom
        style={{ backgroundColor: accentColor }}
      >
        Adicionar Variável
      </Button>
    </div>
  );
}
