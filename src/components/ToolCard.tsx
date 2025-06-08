// src/components/ToolCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, FileText, Pencil, ChevronDown } from 'lucide-react';
import type { SubOption } from '@/lib/types';
import { IconButton } from './IconButton'; // Import the new component

interface ToolCardProps {
  name: string;
  subOptions: SubOption[];
  onDelete: () => void;
  onEdit: () => void;
  onAddSubOption: () => void;
  onEditSubOption: (subOption: SubOption) => void;
  onDeleteSubOption: (subOptionId: string) => void;
  onManageSubOption: (subOption: SubOption) => void;
  accentColor: string; // For category color
}

export function ToolCard({ 
  name, 
  subOptions, 
  onDelete, 
  onEdit, 
  onAddSubOption, 
  onEditSubOption, 
  onDeleteSubOption, 
  onManageSubOption, 
  accentColor 
}: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="bg-card rounded-lg shadow-md flex flex-col transition-colors border-t-4" 
      style={{ borderColor: accentColor }}
    >
      <div className="group p-3 flex justify-between items-center">
        <p className="font-medium text-foreground flex-1 mr-2">{name}</p>
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <IconButton onClick={onEdit} ariaLabel="Editar ferramenta" title="Editar ferramenta" className="hover:text-accent text-muted-foreground h-7 w-7">
              <Pencil size={16} />
            </IconButton>
            <IconButton onClick={onAddSubOption} ariaLabel="Adicionar sub-opções" title="Adicionar sub-opções" className="hover:text-accent text-muted-foreground h-7 w-7">
              <Plus size={16} />
            </IconButton>
            <IconButton onClick={onDelete} ariaLabel="Deletar ferramenta" title="Deletar ferramenta" className="hover:text-destructive text-muted-foreground h-7 w-7">
              <Trash2 size={16} />
            </IconButton>
          </div>
          <IconButton 
            onClick={() => setIsOpen(!isOpen)} 
            ariaLabel={isOpen ? "Recolher sub-opções" : "Expandir sub-opções"} 
            title={isOpen ? "Recolher sub-opções" : "Expandir sub-opções"} 
            className="text-muted-foreground hover:text-accent h-7 w-7"
          >
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={20} />
            </motion.div>
          </IconButton>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-3 px-3 border-t border-border space-y-2">
              {subOptions && subOptions.length > 0 ? (
                subOptions.map((option) => (
                  <div key={option.id} className="group/sub flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <p className="text-sm text-muted-foreground flex-1 mr-2">{option.name}</p>
                    <div className="flex items-center space-x-0.5 text-muted-foreground opacity-0 group-hover/sub:opacity-100 focus-within:opacity-100 transition-opacity">
                      <IconButton 
                        onClick={() => onEditSubOption(option)} 
                        ariaLabel={`Editar sub-opção ${option.name}`} 
                        title={`Editar sub-opção ${option.name}`}
                        className="hover:text-accent h-6 w-6"
                      >
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton 
                        onClick={() => onManageSubOption(option)} 
                        ariaLabel={`Gerenciar telas para ${option.name}`} 
                        title={`Gerenciar telas para ${option.name}`}
                        className="hover:text-accent h-6 w-6"
                      >
                        <FileText size={14} />
                      </IconButton>
                      <IconButton 
                        onClick={() => onDeleteSubOption(option.id)} 
                        ariaLabel={`Deletar sub-opção ${option.name}`} 
                        title={`Deletar sub-opção ${option.name}`}
                        className="hover:text-destructive h-6 w-6"
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/70 italic text-center py-2">Sem sub-opções definidas.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
