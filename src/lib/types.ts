// src/lib/types.ts
export type ToolCategory = 'triggers' | 'actions' | 'constraints';

export interface Tool {
  id: string;
  name: string;
  // Futuramente, adicionaremos sub-opções aqui
}

export interface ToolsState {
  triggers: Tool[];
  actions: Tool[];
  constraints: Tool[];
  addTool: (category: ToolCategory, tool: Tool) => void;
  removeTool: (category: ToolCategory, toolId: string) => void;
}

export interface GeneratedPlan {
  macroName: string;
  explanation: string;
  triggers: string[];
  actions: string[];
  constraints: string[];
}
