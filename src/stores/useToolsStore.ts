// src/stores/useToolsStore.ts
import { create } from 'zustand';
import type { Tool, ToolCategory, Variable } from '@/lib/types';

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
      const parsed = JSON.parse(item) as Partial<StoredState>; // Cast to partial to handle missing keys
      return {
        triggers: parsed.triggers || [],
        actions: parsed.actions || [],
        constraints: parsed.constraints || [],
        variables: parsed.variables || [], // Ensure variables defaults to empty array if not present
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
  addVariable: (variable: Variable) => void;
  removeVariable: (variableId: string) => void;
  updateVariable: (variableId: string, updatedData: Partial<Variable>) => void;
  hydrate: () => void;
}

export const useToolsStore = create<ToolsState>((set) => {
  const initialState = loadState(); // Load initial state once
  return {
    triggers: initialState.triggers,
    actions: initialState.actions,
    constraints: initialState.constraints,
    variables: initialState.variables,

    hydrate: () => {
      // Hydrate ensures that if the store was initialized on server, client syncs with localStorage
      // For this setup, loadState() at create time might be enough if no server-side init is happening.
      // However, keeping hydrate if it's called explicitly on app mount.
      set(loadState());
    },

    addTool: (category, tool) => {
      set((state) => {
        if (category === 'variables') { // Should not happen with current UI but good for type safety
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

    addVariable: (variable) => {
      set((state) => {
        const newState = { ...state, variables: [...state.variables, variable] };
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

// Call hydrate on initial load if not done elsewhere (e.g., in _app.tsx or a root layout client component)
// For this specific setup, direct initialization in create() with loadState() is primary.
// If explicit hydration is needed on app mount, it should be called from a useEffect in a top-level client component.
// For example, in Home (page.tsx): useEffect(() => { useToolsStore.getState().hydrate(); }, []);
