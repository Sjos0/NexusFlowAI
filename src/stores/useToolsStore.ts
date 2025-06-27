// src/stores/useToolsStore.ts
import { create } from 'zustand';
import type { Tool, ToolCategory, Variable, VariableType, SubOption, Tela } from '@/lib/types';
import { variableTypes } from '@/lib/types';

const STORAGE_KEY = 'nexusflow-tools-storage';

export type StoredState = Pick<ToolsState, 'triggers' | 'actions' | 'constraints' | 'variables'>;

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
      
      const validatedVariables = (parsed.variables || []).map(v => ({
        id: v.id || crypto.randomUUID(),
        name: v.name || 'Variável Sem Nome',
        type: variableTypes.includes(v.type as VariableType) ? v.type as VariableType : 'String',
        isSecure: typeof v.isSecure === 'boolean' ? v.isSecure : false,
        description: v.description || '',
      }));

      const validateTools = (tools: Tool[] | undefined): Tool[] => {
        return (tools || []).map(tool => ({
          ...tool,
          id: tool.id || crypto.randomUUID(),
          name: tool.name || 'Ferramenta Sem Nome',
          subOptions: (tool.subOptions || []).map(so => ({
            ...so,
            id: so.id || crypto.randomUUID(),
            name: so.name || 'SubOpção Sem Nome',
            telas: (so.telas || []).map(t => ({
              ...t,
              id: t.id || crypto.randomUUID(),
              content: t.content || '',
            })),
          })),
        }));
      };


      return {
        triggers: validateTools(parsed.triggers),
        actions: validateTools(parsed.actions),
        constraints: validateTools(parsed.constraints),
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
  addVariable: (variableData: Omit<Variable, 'id' | 'description'>) => void;
  removeVariable: (variableId: string) => void;
  updateVariable: (variableId: string, updatedData: Partial<Omit<Variable, 'id' | 'description'>>) => void;
  hydrate: () => void;
  overwriteState: (newState: StoredState) => void;
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
          description: '', 
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
    overwriteState: (newState) => {
       const validatedVariables = (newState.variables || []).map(v => ({
        id: v.id || crypto.randomUUID(),
        name: v.name || 'Variável Sem Nome',
        type: variableTypes.includes(v.type as VariableType) ? v.type as VariableType : 'String',
        isSecure: typeof v.isSecure === 'boolean' ? v.isSecure : false,
        description: v.description || '',
      }));

      const validateTools = (tools: Tool[] | undefined): Tool[] => {
        return (tools || []).map(tool => ({
          ...tool,
          id: tool.id || crypto.randomUUID(),
          name: tool.name || 'Ferramenta Sem Nome',
          subOptions: (tool.subOptions || []).map(so => ({
            ...so,
            id: so.id || crypto.randomUUID(),
            name: so.name || 'SubOpção Sem Nome',
            telas: (so.telas || []).map(t => ({
              ...t,
              id: t.id || crypto.randomUUID(),
              content: t.content || '',
            })),
          })),
        }));
      };

      const validState: StoredState = {
        triggers: validateTools(newState.triggers),
        actions: validateTools(newState.actions),
        constraints: validateTools(newState.constraints),
        variables: validatedVariables,
      };
      set(validState);
      saveState(validState);
    },
  };
});
