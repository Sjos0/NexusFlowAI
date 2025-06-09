// src/components/ManageTelasModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Check, Edit2, Save } from 'lucide-react';
import { Tela, SubOption } from '@/lib/types';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { IconButton } from './IconButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface ManageTelasModalProps {
  onClose: () => void;
  subOption: SubOption;
  onSave: (updatedSubOption: SubOption) => void;
}

export function ManageTelasModal({ onClose, subOption, onSave }: ManageTelasModalProps) {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [newTelaContent, setNewTelaContent] = useState('');
  
  const [editingContent, setEditingContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const newTelaTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTelaTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTelas(subOption.telas || []);
    // Focus on new tela input when modal opens, but not if an edit is in progress
    if (!editingId) {
        newTelaTextareaRef.current?.focus();
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingId) {
          handleCancelEditing();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [subOption, onClose, editingId]);

  useEffect(() => {
    if (editingId) {
        editTelaTextareaRef.current?.focus();
        editTelaTextareaRef.current?.select();
    }
  }, [editingId]);


  const handleStartEditing = (tela: Tela) => {
    setEditingId(tela.id);
    setEditingContent(tela.content);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingContent('');
    newTelaTextareaRef.current?.focus(); // Return focus to add new
  };

  const handleSaveEdit = () => {
    if (editingId === null || !editingContent.trim()) return;
    setTelas(prevTelas =>
      prevTelas.map(t => (t.id === editingId ? { ...t, content: editingContent.trim() } : t))
    );
    handleCancelEditing(); 
  };

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
        className="bg-card p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
          <h2 className="font-headline text-xl mb-1 text-foreground">Gerenciar Contexto (Telas)</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Para a sub-opção: <span className="text-primary font-semibold">"{subOption.name}"</span>
          </p>
        </div>
        
        <ScrollArea className="flex-grow mb-4 pr-3 -mr-1 my-4"> {/* Adjusted -mr-4 to -mr-1 to match scroll-area styles */}
          <div className="space-y-3">
            {telas.length === 0 && <p className="text-center text-muted-foreground p-4 italic">Nenhuma tela de contexto adicionada.</p>}
            {telas.map(tela => (
              <div key={tela.id} className="bg-muted p-3 rounded-md text-sm group relative">
                {editingId === tela.id ? (
                  // EDITING VIEW
                  <div className="space-y-2">
                    <Label htmlFor={`edit-tela-${tela.id}`} className="sr-only">Editar conteúdo da tela</Label>
                    <TextareaAutosize
                      id={`edit-tela-${tela.id}`}
                      ref={editTelaTextareaRef}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full bg-input border-border rounded-md p-2 text-foreground focus:outline-none min-h-[60px]"
                      minRows={2}
                    />
                    <div className="flex justify-end space-x-4 pt-1">
                      <Button variant="ghost" size="sm" onClick={handleCancelEditing} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</Button>
                      <Button size="sm" onClick={handleSaveEdit} className="text-xs" disabled={!editingContent.trim()}>
                        <Check size={14} className="mr-1.5"/>Salvar Alteração
                      </Button>
                    </div>
                  </div>
                ) : (
                  // DISPLAY VIEW
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-muted-foreground whitespace-pre-wrap flex-grow break-words py-1 pr-16">{tela.content}</p>
                    <div className="absolute top-2 right-2 flex flex-col items-end space-y-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <IconButton onClick={() => handleStartEditing(tela)} ariaLabel="Editar tela" className="p-1.5 hover:bg-accent/20 rounded-md">
                        <Edit2 size={14} className="text-muted-foreground hover:text-primary"/>
                      </IconButton>
                      <IconButton onClick={() => handleRemoveTela(tela.id)} ariaLabel="Remover tela" className="p-1.5 hover:bg-destructive/20 rounded-md">
                        <X size={16} className="text-muted-foreground hover:text-destructive"/>
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* ADD NEW TELA AREA */}
        <div className="flex-shrink-0 space-y-3 border-t border-border pt-4">
          <Label htmlFor="newTelaContent" className="text-sm font-medium text-muted-foreground">Adicionar Nova Tela de Contexto</Label>
          <TextareaAutosize
            id="newTelaContent"
            ref={newTelaTextareaRef}
            minRows={2}
            maxRows={5}
            value={newTelaContent}
            onChange={(e) => setNewTelaContent(e.target.value)}
            placeholder="Digite as instruções ou contexto para a IA para esta opção..."
            className="w-full bg-input border-border text-foreground rounded-md p-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAddTela();
              }
            }}
          />
          <Button onClick={handleAddTela} variant="outline" className="w-full" disabled={!newTelaContent.trim()}>
            <Plus size={16} className="mr-2" />
            Adicionar Tela (Ctrl+Enter)
          </Button>
        </div>
        
        <div className="flex-shrink-0 flex justify-end mt-6">
          <Button type="button" onClick={handleSaveAndClose} size="lg">
            <Save size={18} className="mr-2"/>SALVAR TUDO E FECHAR
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
