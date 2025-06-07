// src/components/AddToolModal.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddToolModalProps {
  onClose: () => void;
  onAdd: (name: string) => void;
  categoryTitle: string;
}

export function AddToolModal({ onClose, onAdd, categoryTitle }: AddToolModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focar no input quando o modal abrir
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      onClose();
    }
  };

  // Lidar com a tecla Escape para fechar o modal
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
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-headline text-2xl mb-6 text-foreground">Adicionar em {categoryTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="toolName" className="text-muted-foreground mb-2 block">Nome da Ferramenta</Label>
            <Input
              id="toolName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lembrete Diário"
              className="w-full"
              ref={inputRef}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
