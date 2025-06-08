// src/lib/types.ts
export type ToolCategory = 'triggers' | 'actions' | 'constraints';

export interface Tool {
  id: string;
  name: string;
  subOptions: string[];
}

// NEW: Define the structure for a single step in the plan
export interface PlanStep {
  type: 'GATILHO' | 'AÇÃO' | 'RESTRIÇÃO';
  toolName: string;
  chosenSubOptions: string[];
  detailedSteps: string[];
}

// NEW: The complete plan is a name and an array of these steps
export interface GeneratedPlan {
  macroName: string;
  steps: PlanStep[];
}
