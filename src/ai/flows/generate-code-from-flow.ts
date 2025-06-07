'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating JavaScript code and documentation from an automation flow design using AI.
 *
 * - generateCodeFromFlow - A function that takes an automation flow design as input and returns JavaScript code and documentation.
 * - GenerateCodeFromFlowInput - The input type for the generateCodeFromFlow function.
 * - GenerateCodeFromFlowOutput - The return type for the generateCodeFromFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromFlowInputSchema = z.object({
  flowDesign: z
    .string()
    .describe(
      'A description of the automation flow design.  Include all steps and logic in natural language.'
    ),
});
export type GenerateCodeFromFlowInput = z.infer<typeof GenerateCodeFromFlowInputSchema>;

const GenerateCodeFromFlowOutputSchema = z.object({
  javaScriptCode: z.string().describe('The generated JavaScript code snippet.'),
  documentation: z.string().describe('The documentation for the generated code.'),
});
export type GenerateCodeFromFlowOutput = z.infer<typeof GenerateCodeFromFlowOutputSchema>;

export async function generateCodeFromFlow(input: GenerateCodeFromFlowInput): Promise<GenerateCodeFromFlowOutput> {
  return generateCodeFromFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromFlowPrompt',
  input: {schema: GenerateCodeFromFlowInputSchema},
  output: {schema: GenerateCodeFromFlowOutputSchema},
  prompt: `You are an AI expert in generating Javascript code and documentation from an automation flow design.

  Given the following automation flow design, generate a JavaScript code snippet and documentation for it.

  Flow Design: {{{flowDesign}}}

  Make sure the code is runnable and includes error handling and logging.
  The code should be modern Javascript, and should follow best practices.
  The documentation should be clear and concise.
`,
});

const generateCodeFromFlowFlow = ai.defineFlow(
  {
    name: 'generateCodeFromFlowFlow',
    inputSchema: GenerateCodeFromFlowInputSchema,
    outputSchema: GenerateCodeFromFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
