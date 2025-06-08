// src/components/EditToolModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Tool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditToolModalProps {
  onClose: () => void;
  onSave: (newName: string) => void;
  tool: Tool; // Tool being edited
}

export function EditToolModal({ onClose, onSave, tool }: EditToolModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tool) {
      setName(tool.name);
    }
    inputRef.current?.focus();
    inputRef.current?.select(); // Select text for easy replacement

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [tool, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== tool.name) {
      onSave(name.trim());
    }
    onClose(); // Close modal whether saved or not
  };

  if (!tool) return null; // Should not happen if isOpen logic is correct

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
        <h2 className="font-headline text-xl mb-6 text-foreground">Editar Ferramenta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="toolNameEdit" className="text-muted-foreground sr-only">Nome da Ferramenta</Label>
            <Input
              id="toolNameEdit"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Ferramenta"
              className="w-full"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
