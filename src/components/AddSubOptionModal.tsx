// src/components/AddSubOptionModal.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddSubOptionModalProps {
  onClose: () => void;
  onAdd: (subOption: string) => void;
  toolName: string;
}

export function AddSubOptionModal({ onClose, onAdd, toolName }: AddSubOptionModalProps) {
  const [subOption, setSubOption] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
    if (subOption.trim()) {
      onAdd(subOption.trim());
      onClose();
    }
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
        <h2 className="font-headline text-xl mb-1 text-foreground">Adicionar Sub-Opção</h2>
        <p className="text-muted-foreground mb-4 text-sm">para "{toolName}"</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subOptionName" className="text-muted-foreground sr-only">Nome da Sub-Opção</Label>
            <Input
              id="subOptionName"
              type="text"
              value={subOption}
              onChange={(e) => setSubOption(e.target.value)}
              placeholder="Ex: Conectado a SSID Específico"
              className="w-full"
              required
              ref={inputRef}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Sub-Opção
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
