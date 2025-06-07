// src/components/AddToolModal.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddToolModalProps {
  onClose: () => void;
  onAdd: (name: string, subOptions: string[]) => void;
  categoryTitle: string;
}

export function AddToolModal({ onClose, onAdd, categoryTitle }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [subOptions, setSubOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const optionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleAddOption = () => {
    if (currentOption.trim()) {
      setSubOptions([...subOptions, currentOption.trim()]);
      setCurrentOption('');
      optionInputRef.current?.focus();
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setSubOptions(subOptions.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), subOptions);
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
      onClick={onClose} // Allow closing by clicking backdrop
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        <h2 className="font-headline text-2xl mb-6 text-foreground">Adicionar em {categoryTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="toolName" className="text-muted-foreground mb-2 block">Nome da Ferramenta</Label>
            <Input
              id="toolName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nível da Bateria"
              className="w-full"
              ref={nameInputRef}
              required
            />
          </div>

          <div>
            <Label htmlFor="subOption" className="text-muted-foreground mb-2 block">Sub-Opções (Opcional)</Label>
            <div className="flex items-center space-x-2 mb-3">
              <Input
                id="subOption"
                type="text"
                value={currentOption}
                onChange={(e) => setCurrentOption(e.target.value)}
                placeholder="Ex: Abaixo de 15%"
                className="flex-grow"
                ref={optionInputRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <Button type="button" onClick={handleAddOption} variant="outline" size="icon" aria-label="Adicionar sub-opção">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {subOptions.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {subOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span className="text-sm text-muted-foreground">{option}</span>
                    <Button 
                      type="button" 
                      onClick={() => handleRemoveOption(index)} 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive h-6 w-6"
                      aria-label={`Remover opção ${option}`}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Ferramenta
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
