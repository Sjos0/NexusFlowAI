// src/lib/types.ts
export type ToolCategory = 'triggers' | 'actions' | 'constraints' | 'variables';

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

export interface Variable {
  id: string;
  name: string;
  description: string;
}

export interface PlanStep {
  type: 'GATILHO' | 'AÇÃO' | 'RESTRIÇÃO';
  toolName: string;
  chosenSubOptions: string[];
  detailedSteps: string; // Holds Markdown content
}

export interface GeneratedPlan {
  macroName: string;
  steps: PlanStep[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string | GeneratedPlan;
}
