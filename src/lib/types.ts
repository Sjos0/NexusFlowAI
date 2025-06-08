// src/lib/types.ts
export type ToolCategory = 'triggers' | 'actions' | 'constraints';

export interface Tool {
  id: string;
  name: string;
  subOptions: string[];
}

export interface PlanStep {
  type: 'GATILHO' | 'AÇÃO' | 'RESTRIÇÃO';
  toolName: string;
  chosenSubOptions: string[];
  detailedSteps: string; // CRITICAL CHANGE: This is now a single string to hold Markdown content.
}

export interface GeneratedPlan {
  macroName: string;
  steps: PlanStep[];
}
