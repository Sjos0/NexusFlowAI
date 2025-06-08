
// src/app/api/generate-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import type { Tool } from '@/lib/types';
// Removed: import '../../../../genkit.config';

const formatToolsForSuggestion = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhum';
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

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-05-20',
      prompt: masterPrompt,
      config: { temperature: 0.8 }, 
    });
    
    const mainCandidate = llmResponse.candidates[0];
    if (!mainCandidate || mainCandidate.finishReason !== 'STOP' || !mainCandidate.output?.text) {
      const reason = mainCandidate?.finishReason || 'UNKNOWN_REASON';
      const messageText = mainCandidate?.output?.text || 'Nenhuma mensagem de saída do LLM.';
      console.error(`Falha na geração do LLM para sugestões. Razão: ${reason}. Saída: ${messageText}`, llmResponse);
      throw new Error(`Falha na geração de sugestões da IA: ${reason}. ${messageText}`);
    }

    const responseTextRaw = mainCandidate.output.text;
        
    let responseText = responseTextRaw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    
    let suggestions;
    try {
        suggestions = JSON.parse(responseText);
    } catch (parseError) {
        console.error("Erro ao parsear JSON de sugestões da IA:", parseError, "Texto recebido:", responseText);
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
    suggestions.forEach((sug: any, index: number) => {
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
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? String(error) : "Detalhes não disponíveis" }, { status: 500 });
  }
}
