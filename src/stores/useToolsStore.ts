// src/stores/useToolsStore.ts
import { create } from 'zustand';
import type { Tool, ToolCategory } from '@/lib/types';

const STORAGE_KEY = 'nexusflow-tools-storage';

// Function to load the state from localStorage
const loadState = (): Pick<ToolsState, 'triggers' | 'actions' | 'constraints'> => {
  if (typeof window === 'undefined') {
    return { triggers: [], actions: [], constraints: [] };
  }
  
  const item = window.localStorage.getItem(STORAGE_KEY);

  if (item) {
    try {
      // Attempt to parse the item
      return JSON.parse(item);
    } catch (error) {
      // If parsing fails, log a warning and try to remove the corrupted item
      console.warn(
        `Failed to parse localStorage item for key '${STORAGE_KEY}'. Item was: "${item}". Error: ${error}. Resetting to default state and attempting to remove the corrupted item.`
      );
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (removeError) {
        // Log an error if removal also fails, though this is less critical
        console.error(`Failed to remove corrupted localStorage item '${STORAGE_KEY}':`, removeError);
      }
    }
  }
  // If no item was found, or if parsing failed and item was removed (or removal failed), return default state
  return {
    triggers: [],
    actions: [],
    constraints: [],
  };
};

// Function to save the state to localStorage
const saveState = (state: Pick<ToolsState, 'triggers' | 'actions' | 'constraints'>) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedState = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save state to localStorage", error);
  }
};

export interface ToolsState {
  triggers: Tool[];
  actions: Tool[];
  constraints: Tool[];
  addTool: (category: ToolCategory, tool: Tool) => void;
  removeTool: (category: ToolCategory, toolId: string) => void;
  updateTool: (category: ToolCategory, toolId: string, updatedTool: Partial<Tool>) => void;
  hydrate: () => void;
}

export const useToolsStore = create<ToolsState>((set) => ({
  triggers: [],
  actions: [],
  constraints: [],

  hydrate: () => {
    set(loadState());
  },

  addTool: (category, tool) => {
    set((state) => {
      const newState = { ...state, [category]: [...state[category], tool] };
      saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints });
      return newState;
    });
  },

  removeTool: (category, toolId) => {
    set((state) => {
      const newState = { ...state, [category]: state[category].filter((t) => t.id !== toolId) };
      saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints });
      return newState;
    });
  },

  updateTool: (category, toolId, updatedData) => {
    set((state) => {
      const newState = {
        ...state,
        [category]: state[category].map((t) =>
          t.id === toolId ? { ...t, ...updatedData } : t
        ),
      };
      saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints });
      return newState;
    });
  },
}));
