// src/components/AddSubOptionModal.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddSubOptionModalProps {
  onClose: () => void;
  onAdd: (subOptions: string[]) => void;
  toolName: string;
}

export function AddSubOptionModal({ onClose, onAdd, toolName }: AddSubOptionModalProps) {
  const [textValue, setTextValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textValue.trim()) {
      const parsedOptions = textValue
        .split(',')
        .map(option => option.trim())
        .filter(option => option.length > 0);

      if (parsedOptions.length > 0) {
        onAdd(parsedOptions);
      }
    }
    onClose(); 
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-headline text-xl mb-1 text-foreground">Adicionar Sub-Opções em Lote</h2>
        <p className="text-muted-foreground mb-4 text-sm">para "{toolName}"</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subOptionText" className="text-muted-foreground sr-only">Sub-Opções</Label>
            <Textarea
              id="subOptionText"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Ex: Opção A, Opção B, Opção C"
              className="w-full h-32"
              required
              ref={textareaRef}
            />
            <p className="text-xs text-muted-foreground mt-1">Separe múltiplas opções com uma vírgula.</p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Opções
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
