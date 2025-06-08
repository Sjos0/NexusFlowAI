// src/stores/useToolsStore.ts
import { create } from 'zustand';
import type { Tool, ToolCategory, Variable, VariableType, SubOption, Tela } from '@/lib/types';
import { variableTypes } from '@/lib/types';

const STORAGE_KEY = 'nexusflow-tools-storage';

type StoredState = Pick<ToolsState, 'triggers' | 'actions' | 'constraints' | 'variables'>;

const defaultState: StoredState = {
  triggers: [],
  actions: [],
  constraints: [],
  variables: [],
};

const loadState = (): StoredState => {
  if (typeof window === 'undefined') {
    return { ...defaultState };
  }
  
  const item = window.localStorage.getItem(STORAGE_KEY);

  if (item) {
    try {
      const parsed = JSON.parse(item) as Partial<StoredState>;
      
      // Ensure variables have all required fields with defaults
      const validatedVariables = (parsed.variables || []).map(v => ({
        id: v.id || crypto.randomUUID(), // Should always exist from save, but fallback
        name: v.name || 'Variável Sem Nome',
        type: variableTypes.includes(v.type as VariableType) ? v.type as VariableType : 'String',
        isSecure: typeof v.isSecure === 'boolean' ? v.isSecure : false,
        description: v.description || '',
      }));

      return {
        triggers: parsed.triggers || [],
        actions: parsed.actions || [],
        constraints: parsed.constraints || [],
        variables: validatedVariables,
      };
    } catch (error) {
      console.warn(
        `Failed to parse localStorage item for key '${STORAGE_KEY}'. Item was: "${item}". Error: ${error}. Resetting to default state and attempting to remove the corrupted item.`
      );
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (removeError) {
        console.error(`Failed to remove corrupted localStorage item '${STORAGE_KEY}':`, removeError);
      }
    }
  }
  return { ...defaultState };
};

const saveState = (state: StoredState) => {
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
  variables: Variable[];
  addTool: (category: ToolCategory, tool: Tool) => void;
  removeTool: (category: ToolCategory, toolId: string) => void;
  updateTool: (category: ToolCategory, toolId: string, updatedTool: Partial<Tool>) => void;
  addVariable: (variableData: Omit<Variable, 'id' | 'description'>) => void; // Description is optional, handled internally if needed
  removeVariable: (variableId: string) => void;
  updateVariable: (variableId: string, updatedData: Partial<Omit<Variable, 'id' | 'description'>>) => void;
  hydrate: () => void;
}

export const useToolsStore = create<ToolsState>((set) => {
  const initialState = loadState();
  return {
    triggers: initialState.triggers,
    actions: initialState.actions,
    constraints: initialState.constraints,
    variables: initialState.variables,

    hydrate: () => {
      set(loadState());
    },

    addTool: (category, tool) => {
      set((state) => {
        if (category === 'variables') {
          console.warn("Attempted to add a variable using addTool. Use addVariable instead.");
          return state;
        }
        const newState = { ...state, [category]: [...state[category], tool] };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },

    removeTool: (category, toolId) => {
      set((state) => {
        if (category === 'variables') {
           console.warn("Attempted to remove a variable using removeTool. Use removeVariable instead.");
           return state;
        }
        const newState = { ...state, [category]: state[category].filter((t) => t.id !== toolId) };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },

    updateTool: (category, toolId, updatedData) => {
      set((state) => {
         if (category === 'variables') {
            console.warn("Attempted to update a variable using updateTool. Use updateVariable instead.");
            return state;
         }
        const newState = {
          ...state,
          [category]: state[category].map((t) =>
            t.id === toolId ? { ...t, ...updatedData } : t
          ),
        };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },

    addVariable: (variableData) => {
      set((state) => {
        const newVariable: Variable = { 
          ...variableData, 
          id: crypto.randomUUID(),
          description: '', // Initialize with empty description
        };
        const newState = { ...state, variables: [...state.variables, newVariable] };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },

    removeVariable: (variableId) => {
      set((state) => {
        const newState = { ...state, variables: state.variables.filter((v) => v.id !== variableId) };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },

    updateVariable: (variableId, updatedData) => {
      set((state) => {
        const newState = {
          ...state,
          variables: state.variables.map((v) =>
            v.id === variableId ? { ...v, ...updatedData } : v
          ),
        };
        saveState({ triggers: newState.triggers, actions: newState.actions, constraints: newState.constraints, variables: newState.variables });
        return newState;
      });
    },
  };
});
