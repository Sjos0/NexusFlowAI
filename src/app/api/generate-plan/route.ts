// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Using the pre-configured ai object
import type { Tool } from '@/lib/types';

const formatToolsForPrompt = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhum';
  return tools.map(t => `${t.name}${t.subOptions.length > 0 ? ` (Opções: ${t.subOptions.join(', ')})` : ''}`).join('; ');
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, tools } = await req.json();

    const availableTriggers = formatToolsForPrompt(tools.triggers);
    const availableActions = formatToolsForPrompt(tools.actions);
    const availableConstraints = formatToolsForPrompt(tools.constraints);

    const masterPrompt = `
      Você é um assistente especialista em MacroDroid. Sua tarefa é criar um plano de automação detalhado a partir do pedido de um usuário e de uma lista de ferramentas disponíveis.

      **Sua resposta DEVE ser um objeto JSON VÁLIDO e NADA MAIS, seguindo estritamente a estrutura abaixo:**
      {
        "macroName": "Um nome curto e descritivo para a automação.",
        "steps": [
          {
            "type": "GATILHO",
            "toolName": "Nome exato da ferramenta usada da lista de Gatilhos Disponíveis",
            "chosenSubOptions": ["Opção 1 escolhida para o gatilho", "Opção 2 se houver"],
            "detailedSteps": [
              "Primeiro passo detalhado e didático de como configurar esta ferramenta de gatilho no MacroDroid.",
              "Segundo passo, explicando alguma configuração específica do gatilho.",
              "Terceiro passo, se necessário para o gatilho."
            ]
          },
          {
            "type": "AÇÃO",
            "toolName": "Nome exato da ferramenta usada da lista de Ações Disponíveis",
            "chosenSubOptions": ["Opção 1 escolhida para a ação"],
            "detailedSteps": [
              "Primeiro passo detalhado e didático de como configurar esta ferramenta de ação no MacroDroid.",
              "Segundo passo, explicando alguma configuração específica da ação."
            ]
          },
          {
            "type": "RESTRIÇÃO",
            "toolName": "Nome exato da ferramenta usada da lista de Restrições Disponíveis",
            "chosenSubOptions": [],
            "detailedSteps": [
              "Primeiro passo detalhado e didático de como configurar esta ferramenta de restrição no MacroDroid."
            ]
          }
        ]
      }

      **REGRAS CRÍTICAS:**
      1.  **Use APENAS as ferramentas e sub-opções da lista de disponíveis.** Se uma ferramenta não estiver na lista fornecida para uma categoria (Gatilhos, Ações, Restrições), você NÃO PODE usá-la.
      2.  Para cada passo no array "steps", forneça um guia "detailedSteps" REAL e PRÁTICO sobre como configurar essa ferramenta específica no aplicativo MacroDroid. Seja um professor. Os passos devem ser claros e acionáveis.
      3.  Se uma ferramenta não tem sub-opções relevantes para o pedido ou se as sub-opções da ferramenta não são aplicáveis, o array "chosenSubOptions" deve ser vazio [].
      4.  Se o pedido do usuário for impossível de realizar com as ferramentas fornecidas, retorne um JSON com "macroName": "Plano Impossível" e um único passo em "steps" do tipo "AÇÃO" com "toolName": "Explicação" e "detailedSteps" explicando o porquê (ex: ferramenta X não disponível, ou sub-opção Y necessária mas não existe) e quais tipos de ferramentas ou sub-opções o usuário deveria adicionar. Neste caso, "chosenSubOptions" também será vazio.
      5.  Selecione a(s) sub-opção(ões) mais apropriada(s) para cada ferramenta utilizada, com base no pedido do usuário. Se múltiplas sub-opções de uma mesma ferramenta são necessárias, inclua todas no array "chosenSubOptions".
      6.  O array "steps" deve conter pelo menos um gatilho e uma ação, a menos que seja um "Plano Impossível". Restrições são opcionais.
      7.  Certifique-se que "type" seja exatamente "GATILHO", "AÇÃO", ou "RESTRIÇÃO".

      ---
      Ferramentas Disponíveis:
      Gatilhos Disponíveis: ${availableTriggers}.
      Ações Disponíveis: ${availableActions}.
      Restrições Disponíveis: ${availableConstraints}.
      ---
      Pedido do usuário: "${prompt}"
      ---
      
      Gere o objeto JSON agora.
    `;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest', 
      prompt: masterPrompt,
      config: { temperature: 0.3 }, // Adjusted temperature slightly
    });

    const responseText = (llmResponse.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    let plan;

    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          plan = JSON.parse(jsonMatch[0]);
        } catch (nestedParseError) {
          console.error("Erro ao parsear JSON extraído:", nestedParseError);
          throw new Error('A IA retornou uma resposta em formato JSON inválido, mesmo após tentativa de extração.');
        }
      } else {
        throw new Error('A IA retornou uma resposta que não contém um objeto JSON válido.');
      }
    }
    
    if (!plan.macroName || !Array.isArray(plan.steps)) {
        throw new Error('A IA retornou um plano com formato JSON esperado, mas com campos ausentes ou tipos incorretos.');
    }


    return NextResponse.json(plan);

  } catch (error) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = 'Ocorreu um erro ao gerar o plano JSON.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? String(error) : null },
      { status: 500 }
    );
  }
}
