// src/stores/useToolsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tool, ToolCategory, ToolsState } from '@/lib/types';

// Helper para garantir que o localStorage só seja acessado no cliente
const isClient = typeof window !== 'undefined';

export const useToolsStore = create<ToolsState>()(
  persist(
    (set) => ({
      triggers: [
        { id: '1', name: 'Chamada Recebida', subOptions: ['De qualquer número', 'De contato salvo', 'De número desconhecido'] },
        { id: '2', name: 'Nível da Bateria', subOptions: ['Abaixo de 15%', 'Abaixo de 50%', 'Carregando', 'Totalmente Carregada'] },
      ],
      actions: [
        { id: '3', name: 'Enviar Notificação', subOptions: ['Com som', 'Silenciosa'] },
        { id: '4', name: 'Abrir Aplicativo', subOptions: [] },
        { id: '6', name: 'Definir Volume', subOptions: ['Mudo', 'Vibrar', '50%', 'Máximo'] },
      ],
      constraints: [
        { id: '5', name: 'Dia da Semana', subOptions: ['Dias úteis', 'Fim de semana', 'Segunda-feira'] },
        { id: '7', name: 'Horário Específico', subOptions: []},
      ],

      addTool: (category: ToolCategory, tool: Tool) => {
        set((state) => ({
          [category]: [...state[category], tool],
        }));
      },

      removeTool: (category: ToolCategory, toolId: string) => {
        set((state) => ({
          [category]: state[category].filter((tool) => tool.id !== toolId),
        }));
      },
    }),
    {
      name: 'nexusflow-tools-storage', // Nome da chave no localStorage
      // Fornecer um storage dummy no servidor para evitar erros durante SSR/SSG
      storage: isClient ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
      // Atrasar a hidratação até que o cliente esteja pronto
      skipHydration: !isClient,
    }
  )
);

// Disparar a hidratação no cliente após a montagem inicial
if (isClient) {
  useToolsStore.persist.rehydrate();
}
