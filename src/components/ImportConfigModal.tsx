// src/components/ImportConfigModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToolsStore } from '@/stores/useToolsStore';
import { importKnowledgeBaseFromText } from '@/lib/kbManager';

interface ImportConfigModalProps {
  onClose: () => void;
}

export function ImportConfigModal({ onClose }: ImportConfigModalProps) {
  const [configText, setConfigText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { overwriteState } = useToolsStore();

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

  const handleProcessAndReplace = () => {
    if (!configText.trim()) {
      toast.error('A caixa de texto está vazia.');
      return;
    }

    if (!window.confirm('Atenção: Isto irá substituir todo o seu Banco de Conhecimento atual. Deseja continuar?')) {
      return;
    }

    const toastId = toast.loading('Processando e substituindo dados...');
    try {
      const importedData = importKnowledgeBaseFromText(configText);
      overwriteState(importedData);
      const feedback = `Importação concluída: ${importedData.triggers.length} gatilhos, ${importedData.actions.length} ações, ${importedData.constraints.length} restrições e ${importedData.variables.length} variáveis foram carregadas.`;
      toast.success(feedback, { id: toastId, duration: 6000 });
      onClose();
    } catch (err) {
      console.error("Erro ao importar configuração:", err);
      const errorMessage = err instanceof Error ? err.message : 'O texto fornecido é inválido ou está em um formato incorreto.';
      toast.error(`Erro na importação: ${errorMessage}`, { id: toastId });
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
        className="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-headline text-xl mb-4 text-foreground">Colar Configurações do Banco de Conhecimento</h2>
        <div className="space-y-4">
          <Label htmlFor="config-paste-area" className="text-muted-foreground">
            Cole o texto de configuração copiado na área abaixo.
          </Label>
          <Textarea
            id="config-paste-area"
            ref={textareaRef}
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder="Cole o texto de configuração aqui..."
            className="w-full h-64 font-mono text-sm"
            required
          />
        </div>
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleProcessAndReplace} disabled={!configText.trim()}>
            Processar e Substituir
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
