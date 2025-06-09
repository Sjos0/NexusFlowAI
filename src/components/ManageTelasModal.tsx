// src/components/ManageTelasModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Edit2, Trash2, Save } from 'lucide-react';
import { Tela, SubOption, Tool, ToolCategory } from '@/lib/types';
import { useToolsStore } from '@/stores/useToolsStore';
import TextareaAutosize from 'react-textarea-autosize';
import { TelaCard } from './TelaCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManageTelasModalProps {
  onClose: () => void;
  toolId: string;
  category: ToolCategory; 
  subOptionId: string;
}

export function ManageTelasModal({ onClose, toolId, category, subOptionId }: ManageTelasModalProps) {
  const { updateTool } = useToolsStore();
  const tool = useToolsStore((state) => (state[category] as Tool[])?.find(t => t.id === toolId));
  const subOption = tool?.subOptions.find(so => so.id === subOptionId);

  const [newTelaContent, setNewTelaContent] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const newTelaTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTelaTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmDeleteId) {
          setConfirmDeleteId(null);
        } else if (editingId) {
          setEditingId(null);
          setEditingContent('');
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, editingId, confirmDeleteId]);

  useEffect(() => {
    if (editingId) {
      editTelaTextareaRef.current?.focus();
      editTelaTextareaRef.current?.select();
    } else if (!confirmDeleteId) { // Don't shift focus if confirm dialog is open
        newTelaTextareaRef.current?.focus();
    }
  }, [editingId, confirmDeleteId]);

  if (!tool || !subOption) {
    useEffect(() => {
      onClose();
    }, [onClose]);
    return null;
  }

  const handleUpdateStoreWithNewSubOptions = (newSubOptionsForTool: SubOption[]) => {
    if (category === 'variables') return; // Should not happen if called correctly
    updateTool(category, toolId, { subOptions: newSubOptionsForTool });
  };

  const handleAddTela = () => {
    if (newTelaContent.trim() && tool) {
      const newTela: Tela = { id: crypto.randomUUID(), content: newTelaContent.trim() };
      const newSubOptionsForTool = tool.subOptions.map(so =>
        so.id === subOptionId ? { ...so, telas: [...(so.telas || []), newTela] } : so
      );
      handleUpdateStoreWithNewSubOptions(newSubOptionsForTool);
      setNewTelaContent('');
      newTelaTextareaRef.current?.focus();
    }
  };

  const handleSaveEdit = () => {
    if (editingId === null || !tool || !editingContent.trim()) return;
    const newSubOptionsForTool = tool.subOptions.map(so =>
      so.id === subOptionId
        ? {
            ...so,
            telas: (so.telas || []).map(t =>
              t.id === editingId ? { ...t, content: editingContent.trim() } : t
            ),
          }
        : so
    );
    handleUpdateStoreWithNewSubOptions(newSubOptionsForTool);
    setEditingId(null);
    setEditingContent('');
    newTelaTextareaRef.current?.focus();
  };
  
  const handleRemoveTelaConfirmed = () => {
    if (confirmDeleteId === null || !tool) return;
    const newSubOptionsForTool = tool.subOptions.map(so =>
      so.id === subOptionId
        ? { ...so, telas: (so.telas || []).filter(t => t.id !== confirmDeleteId) }
        : so
    );
    handleUpdateStoreWithNewSubOptions(newSubOptionsForTool);
    setConfirmDeleteId(null);
    newTelaTextareaRef.current?.focus();
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
        
        <ScrollArea className="flex-grow mb-4 pr-3 -mr-1 my-4">
          <div className="space-y-4">
            {(subOption.telas || []).length === 0 && (
              <p className="text-center text-muted-foreground p-4 italic">Nenhuma tela de contexto adicionada.</p>
            )}
            {(subOption.telas || []).map(tela => (
              <div key={tela.id}>
                {editingId === tela.id ? (
                  <div className="bg-muted p-3 rounded-lg border border-primary space-y-2">
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
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setEditingContent(''); newTelaTextareaRef.current?.focus();}} className="text-xs">Cancelar</Button>
                      <Button size="sm" onClick={handleSaveEdit} className="text-xs" disabled={!editingContent.trim()}>
                        <Check size={14} className="mr-1.5"/>Salvar Alteração
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TelaCard
                    content={tela.content}
                    onEdit={() => { setEditingId(tela.id); setEditingContent(tela.content); }}
                    onRemove={() => setConfirmDeleteId(tela.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 space-y-3 border-t border-border pt-4">
          <Label htmlFor="newTelaContentManageModal" className="text-sm font-medium text-muted-foreground">Adicionar Nova Tela de Contexto</Label>
          <TextareaAutosize
            id="newTelaContentManageModal"
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
          <Button type="button" onClick={onClose} size="lg">
            <Save size={18} className="mr-2"/>FECHAR
          </Button>
        </div>
        
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card p-6 rounded-lg shadow-xl w-full max-w-sm"
            >
              <h3 className="text-lg font-medium text-foreground mb-3">Confirmar Exclusão</h3>
              <p className="text-sm text-muted-foreground mb-5">Tem certeza que deseja deletar esta tela de contexto? Esta ação não pode ser desfeita.</p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {setConfirmDeleteId(null); newTelaTextareaRef.current?.focus();}}>Cancelar</Button>
                <Button variant="destructive" onClick={handleRemoveTelaConfirmed}>Deletar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
