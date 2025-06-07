// Optimize Automation Flow
'use server';
/**
 * @fileOverview An AI agent that optimizes automation flows.
 *
 * - optimizeAutomationFlow - A function that handles the automation flow optimization process.
 * - OptimizeAutomationFlowInput - The input type for the optimizeAutomationFlow function.
 * - OptimizeAutomationFlowOutput - The return type for the optimizeAutomationFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeAutomationFlowInputSchema = z.object({
  flowDesign: z
    .string()
    .describe('The design of the automation flow in JSON format.'),
  userConstraints: z
    .string()
    .optional()
    .describe('Any specific constraints or requirements from the user.'),
});
export type OptimizeAutomationFlowInput = z.infer<typeof OptimizeAutomationFlowInputSchema>;

const OptimizeAutomationFlowOutputSchema = z.object({
  optimizedFlowDesign: z.string().describe('The optimized automation flow design in JSON format.'),
  suggestions: z.array(z.string()).describe('A list of suggestions for improving the flow.'),
  confidenceScore: z.number().describe('A confidence score (0-1) indicating the reliability of the optimization.'),
});
export type OptimizeAutomationFlowOutput = z.infer<typeof OptimizeAutomationFlowOutputSchema>;

export async function optimizeAutomationFlow(input: OptimizeAutomationFlowInput): Promise<OptimizeAutomationFlowOutput> {
  return optimizeAutomationFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeAutomationFlowPrompt',
  input: {schema: OptimizeAutomationFlowInputSchema},
  output: {schema: OptimizeAutomationFlowOutputSchema},
  prompt: `You are an AI expert in automation flow optimization. You will receive an automation flow design and, optionally, user constraints.
Your task is to analyze the flow and provide an optimized flow design, a list of suggestions for improvement, and a confidence score indicating the reliability of the optimization.

Automation Flow Design:
{{flowDesign}}

User Constraints (if any):
{{userConstraints}}

Optimize the automation flow, provide clear and actionable suggestions, and assign a confidence score based on the certainty of your optimizations.
The optimized flow design should be a valid JSON.
`,
});

const optimizeAutomationFlowFlow = ai.defineFlow(
  {
    name: 'optimizeAutomationFlowFlow',
    inputSchema: OptimizeAutomationFlowInputSchema,
    outputSchema: OptimizeAutomationFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
