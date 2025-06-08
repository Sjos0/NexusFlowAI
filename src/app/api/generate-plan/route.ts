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
      Você é um arquiteto de automação criativo e engenhoso, especialista em MacroDroid. Sua tarefa é ir além do óbvio para criar o melhor plano possível para o usuário, considerando todas as ferramentas disponíveis.

      **SEU PROCESSO DE PENSAMENTO (PRE-PLANNING):**
      1.  **Analise o Objetivo Central:** Leia atentamente o pedido do usuário para entender a intenção e o resultado final desejado. Não se prenda a uma interpretação literal se uma solução mais robusta ou elegante for possível com as ferramentas.
      2.  **Estratégia de Ferramentas:** Pense em como combinar as "Ferramentas Disponíveis" para atingir o objetivo. Lembre-se que você pode usar **múltiplos gatilhos, múltiplas ações e múltiplas restrições** se isso levar a uma automação mais completa ou eficaz. Avalie se todas as ferramentas são necessárias ou se alguma combinação é mais inteligente.
      3.  **Seleção de Sub-Opções:** Para cada ferramenta escolhida que possua sub-opções, selecione a(s) sub-opção(ões) MAIS RELEVANTE(S) para o contexto do pedido. Se nenhuma sub-opção for adequada, não use essa ferramenta ou use-a sem sub-opções se aplicável.
      4.  **Formule o Plano Detalhado:** Após definir a estratégia e as ferramentas, estruture sua resposta no formato JSON especificado.

      **FORMATO DA RESPOSTA JSON (OBRIGATÓRIO):**
      Sua resposta DEVE ser um objeto JSON VÁLIDO e NADA MAIS, com a seguinte estrutura:
      {
        "macroName": "Um nome curto, claro e descritivo para a automação.",
        "steps": [
          {
            "type": "GATILHO", // Ou "AÇÃO", ou "RESTRIÇÃO"
            "toolName": "Nome exato da ferramenta utilizada (da lista de Ferramentas Disponíveis)",
            "chosenSubOptions": ["Opção 1 escolhida para a ferramenta", "Opção 2 se houver mais de uma relevante"], // Array de strings. Vazio [] se nenhuma sub-opção for usada.
            "detailedSteps": "Um texto único contendo a explicação detalhada em formato **Markdown**. Use listas com '-', texto em **negrito** para ênfase, e explique o porquê de cada passo de forma didática e clara. Seja prático, como se estivesse guiando o usuário dentro do app MacroDroid. Não adicione numeração automática (1., 2.) no Markdown, use hífens (-) para listas."
          }
          // Pode haver múltiplos objetos no array "steps", inclusive com o mesmo "type" (ex: dois gatilhos).
        ]
      }

      **REGRAS FINAIS E CRÍTICAS:**
      - O array "steps" DEVE conter pelo menos um GATILHO e uma AÇÃO, a menos que seja um "Plano Impossível". Restrições são opcionais.
      - Use APENAS ferramentas da lista de "Ferramentas Disponíveis". Não invente ferramentas ou sub-opções.
      - Em "detailedSteps", a explicação deve ser útil e acionável para um usuário do MacroDroid. Forneça dicas de configuração e o raciocínio por trás das escolhas.
      - Se o pedido for impossível de realizar com as ferramentas fornecidas, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas ou sub-opções o usuário deveria adicionar para viabilizar o plano.

      ---
      Ferramentas Disponíveis:
      Gatilhos Disponíveis: ${availableTriggers}.
      Ações Disponíveis: ${availableActions}.
      Restrições Disponíveis: ${availableConstraints}.
      ---
      Pedido do usuário: "${prompt}"
      ---
      
      Gere o objeto JSON agora, seguindo seu processo de pre-planning e todas as regras à risca.
    `;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest', 
      prompt: masterPrompt,
      config: { temperature: 0.5 },
    });

    const responseText = (llmResponse.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    let plan;

    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      // Attempt to extract JSON from a potentially larger string if the AI included extra text
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
    
    // Validate the structure of the plan
    if (!plan.macroName || !Array.isArray(plan.steps)) {
        console.error("Estrutura do plano inválida recebida da IA:", plan);
        throw new Error('A IA retornou um plano com formato JSON esperado, mas com campos ausentes ou tipos incorretos.');
    }
    plan.steps.forEach((step: any, index: number) => {
        if (!step.type || !step.toolName || !Array.isArray(step.chosenSubOptions) || typeof step.detailedSteps !== 'string') {
            console.error(`Estrutura do passo ${index} inválida:`, step);
            throw new Error(`A IA retornou um plano com um passo (${index}) malformado.`);
        }
    });


    return NextResponse.json(plan);

  } catch (error) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = 'Ocorreu um erro ao gerar o plano JSON.';
    if (error instanceof Error) {
        errorMessage = error.message; // Use the specific error message
    }
    // Return detailed error information in development for easier debugging
    // In production, you might want to return a more generic message.
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? String(error) : null },
      { status: 500 }
    );
  }
}
