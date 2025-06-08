// src/components/AddEditVariableModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Variable, VariableType, variableTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddEditVariableModalProps {
  onClose: () => void;
  onSave: (variableData: Omit<Variable, 'id' | 'description'>) => void; // Description is not edited here
  existingVariable?: Variable;
}

export function AddEditVariableModal({ onClose, onSave, existingVariable }: AddEditVariableModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VariableType>('String');
  const [isSecure, setIsSecure] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingVariable) {
      setName(existingVariable.name);
      setType(existingVariable.type);
      setIsSecure(existingVariable.isSecure);
    } else {
      // Reset for new variable
      setName('');
      setType('String');
      setIsSecure(false);
    }
    nameInputRef.current?.focus();
  }, [existingVariable]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), type, isSecure });
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
        <h2 className="font-headline text-xl mb-6 text-foreground">
          {existingVariable ? 'Editar Variável' : 'Criar Nova Variável'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="variableName" className="text-muted-foreground mb-1 block">Nome da Variável</Label>
            <Input
              id="variableName"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: UsuarioLogado"
              className="w-full"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="variableType" className="text-muted-foreground mb-1 block">Tipo da Variável</Label>
            <Select value={type} onValueChange={(value) => setType(value as VariableType)}>
              <SelectTrigger id="variableType" className="w-full">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {variableTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isSecure"
              checked={isSecure}
              onCheckedChange={(checked) => setIsSecure(Boolean(checked))}
            />
            <Label htmlFor="isSecure" className="text-sm font-normal text-muted-foreground">
              Tornar a variável segura (oculta em logs)
            </Label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {existingVariable ? 'Salvar Alterações' : 'Criar Variável'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
