// src/app/api/generate-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai'; // Corrected import
import type { Tool } from '@/lib/types';
import '../../../../genkit.config';

const formatToolsForSuggestion = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhum';
  // Ensure subOptions and telas are handled if they exist, even if just taking tool name for now.
  // For this prompt, only tool names are used as per user spec.
  return tools.map(t => t.name).join(', ');
};

export async function POST(req: NextRequest) {
  try {
    const { tools } = await req.json() as { tools: { triggers: Tool[], actions: Tool[], constraints: Tool[] } };

    const availableToolsSummary = `
      Gatilhos Disponíveis: ${formatToolsForSuggestion(tools.triggers)}.
      Ações Disponíveis: ${formatToolsForSuggestion(tools.actions)}.
      Restrições Disponíveis: ${formatToolsForSuggestion(tools.constraints)}.
    `;

    const masterPrompt = `
      Você é um gerador de ideias para automações no MacroDroid. Com base em uma lista de ferramentas, seu trabalho é criar 5 sugestões de automação criativas e úteis.

      **Sua resposta DEVE ser um array JSON VÁLIDO de objetos e NADA MAIS.**
      Cada objeto no array deve ter a seguinte estrutura:
      {
        "title": "Um nome curto e atrativo para a automação",
        "prompt": "O prompt de texto completo que um usuário escreveria para pedir essa automação."
      }

      **REGRAS:**
      - Baseie as sugestões estritamente nas ferramentas fornecidas.
      - Crie prompts que sejam claros e que levem a resultados interessantes.
      - Varie as ideias, combinando diferentes ferramentas.
      - Certifique-se de que o JSON é válido e não contém texto ou formatação extra fora do array JSON.

      ---
      Ferramentas Disponíveis:
      ${availableToolsSummary}
      ---
      
      Gere o array JSON com 5 sugestões agora.
    `;

    const llmResponse = await generate({
      model: googleAI('gemini-2.5-flash-preview-05-20'), // Using corrected googleAI
      prompt: masterPrompt,
      config: { temperature: 0.8 }, // Higher temperature for more creativity
    });
    
    let responseText = llmResponse.text();
    if (!responseText) {
        throw new Error('LLM returned an empty response for suggestions.');
    }
    // Clean the response: remove potential markdown and ensure it's just the JSON array.
    responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    
    let suggestions;
    try {
        suggestions = JSON.parse(responseText);
    } catch (parseError) {
        console.error("Erro ao parsear JSON de sugestões da IA:", parseError, "Texto recebido:", responseText);
        // Attempt to extract JSON if it's embedded
        const jsonMatch = responseText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[0]) {
            try {
                suggestions = JSON.parse(jsonMatch[0]);
            } catch (nestedParseError) {
                console.error("Erro ao parsear JSON extraído das sugestões:", nestedParseError);
                throw new Error('A IA retornou sugestões em formato JSON inválido, mesmo após tentativa de extração.');
            }
        } else {
            throw new Error('A IA retornou sugestões que não contêm um objeto ou array JSON válido.');
        }
    }
    
    if (!Array.isArray(suggestions)) {
        console.error("Sugestões da IA não são um array:", suggestions);
        throw new Error("A IA não retornou um array de sugestões válido.");
    }
    suggestions.forEach((sug, index) => {
        if (typeof sug.title !== 'string' || typeof sug.prompt !== 'string') {
            console.error(`Sugestão ${index} inválida:`, sug);
            throw new Error(`A IA retornou uma sugestão (${index}) malformada.`);
        }
    });


    return NextResponse.json(suggestions);

  } catch (error) {
    console.error("Erro na API /api/generate-suggestions:", error);
    let errorMessage = 'Falha ao gerar sugestões.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? String(error) : null }, { status: 500 });
  }
}
