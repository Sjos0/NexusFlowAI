// src/components/ManageTelasModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Tela, SubOption } from '@/lib/types';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManageTelasModalProps {
  onClose: () => void;
  subOption: SubOption;
  onSave: (updatedSubOption: SubOption) => void;
}

export function ManageTelasModal({ onClose, subOption, onSave }: ManageTelasModalProps) {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [newTelaContent, setNewTelaContent] = useState('');
  const newTelaTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTelas(subOption.telas || []);
    newTelaTextareaRef.current?.focus();
     const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [subOption, onClose]);

  const handleAddTela = () => {
    if (newTelaContent.trim()) {
      const newTela: Tela = { id: crypto.randomUUID(), content: newTelaContent.trim() };
      setTelas(prevTelas => [...prevTelas, newTela]);
      setNewTelaContent('');
      newTelaTextareaRef.current?.focus();
    }
  };

  const handleRemoveTela = (telaId: string) => {
    setTelas(prevTelas => prevTelas.filter(t => t.id !== telaId));
  };
  
  const handleSaveAndClose = () => {
    onSave({ ...subOption, telas });
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
        className="bg-card p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-headline text-xl mb-1 text-foreground">Gerenciar Telas de Contexto</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Para a sub-opção: <span className="text-primary font-semibold">"{subOption.name}"</span>
        </p>
        
        <ScrollArea className="max-h-[40vh] mb-4 pr-3 border-b border-border pb-2">
          <div className="space-y-2">
            {telas.length === 0 && (
              <p className="text-center text-muted-foreground p-4">Nenhuma tela de contexto adicionada.</p>
            )}
            {telas.map(tela => (
              <div key={tela.id} className="bg-muted p-3 rounded-md flex justify-between items-start text-sm group">
                <p className="text-muted-foreground whitespace-pre-wrap flex-grow mr-2">{tela.content}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveTela(tela.id)} 
                  className="text-muted-foreground hover:text-destructive h-6 w-6 flex-shrink-0 opacity-50 group-hover:opacity-100"
                  aria-label="Remover tela"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-3 mb-6">
          <Label htmlFor="newTelaContent" className="text-muted-foreground sr-only">Nova Tela de Contexto</Label>
          <TextareaAutosize
            id="newTelaContent"
            ref={newTelaTextareaRef}
            minRows={2}
            maxRows={5}
            value={newTelaContent}
            onChange={(e) => setNewTelaContent(e.target.value)}
            placeholder="Digite o texto de ajuda contextual para a IA..."
            className="w-full bg-input border-border text-foreground" 
          />
          <Button onClick={handleAddTela} variant="outline" className="w-full">
            <Plus size={16} className="mr-2" />
            Adicionar Tela
          </Button>
        </div>
        
        <div className="flex justify-end">
          <Button type="button" onClick={handleSaveAndClose}>
            Salvar e Fechar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
