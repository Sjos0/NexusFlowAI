// src/lib/types.ts
export const variableTypes = ['Booleano', 'Inteiro', 'String', 'Decimal', 'Dicionário', 'Lista'] as const;
export type VariableType = typeof variableTypes[number];

export type ToolCategory = 'triggers' | 'actions' | 'constraints' | 'variables';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  isSecure: boolean;
  description?: string; // Optional description for user notes
}

export interface Tela {
  id: string;
  content: string;
}

export interface SubOption {
  id: string;
  name: string;
  telas: Tela[];
}

export interface Tool {
  id: string;
  name: string;
  subOptions: SubOption[];
}

export interface PlanStep {
  type: 'GATILHO' | 'AÇÃO' | 'RESTRIÇÃO';
  toolName: string;
  chosenSubOptions: string[];
  detailedSteps: string;
}

export interface GeneratedPlan {
  macroName: string;
  steps: PlanStep[];
}
