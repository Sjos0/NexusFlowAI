// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Using the pre-configured ai object
import type { Tool } from '@/lib/types';

// Helper function to format tools for the prompt
const formatToolsForPrompt = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhum';
  return tools.map(t => {
    let toolString = t.name;
    if (t.subOptions && t.subOptions.length > 0) {
      toolString += ` (Opções: ${t.subOptions.join(', ')})`;
    }
    return toolString;
  }).join('; ');
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, tools } = await req.json();

    const availableTriggers = formatToolsForPrompt(tools.triggers);
    const availableActions = formatToolsForPrompt(tools.actions);
    const availableConstraints = formatToolsForPrompt(tools.constraints);

    const masterPrompt = `
      Você é um especialista em MacroDroid. Seu objetivo é analisar o pedido de um usuário e as ferramentas (com suas respectivas sub-opções, se houver) que ele tem e criar um plano de automação.

      **Sua resposta DEVE ser um objeto JSON VÁLIDO e NADA MAIS.**
      O JSON deve ter a seguinte estrutura:
      {
        "macroName": "Um nome curto e descritivo para a macro",
        "explanation": "Uma explicação em texto simples e didático de como a automação funciona.",
        "triggers": ["Nome Exato do Gatilho (Sub-Opção Selecionada se aplicável e importante)"],
        "actions": ["Nome Exato da Ação (Sub-Opção Selecionada)", "Outra Ação Nome (Sub-Opção Selecionada)"],
        "constraints": ["Nome Exato da Restrição (Sub-Opção Selecionada se aplicável)"]
      }

      **REGRAS CRÍTICAS:**
      1. Use APENAS os nomes das ferramentas EXATAMENTE como aparecem nas listas de disponíveis.
      2. Para ferramentas com sub-opções, você DEVE escolher a sub-opção mais apropriada para o pedido do usuário e incluí-la entre parênteses após o nome da ferramenta. Exemplo: "Nível da Bateria (Abaixo de 15%)".
      3. Se nenhuma sub-opção de uma ferramenta for adequada, não use essa ferramenta ou, se for essencial, indique que uma sub-opção mais genérica seria necessária (se permitido pela ferramenta).
      4. Se o pedido for impossível de fazer com as ferramentas e sub-opções atuais, os arrays devem vir vazios e a "explanation" deve dizer por que não é possível e o que o usuário precisa adicionar (seja uma nova ferramenta ou uma sub-opção mais adequada para uma ferramenta existente).
      5. Seja conciso no nome da macro e na explicação. Mantenha a estrutura do JSON intacta.
      6. Se uma ferramenta não tiver sub-opções relevantes ou se a sub-opção for implícita (ex: "Abrir Aplicativo" não precisa de sub-opção na resposta, mesmo que possa ter no futuro), apenas use o nome da ferramenta.

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
      config: { temperature: 0.2 },
    });

    const responseText = (llmResponse.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    let plan;

    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      // Tenta dar uma resposta mais útil se o parse falhar.
      // Muitas vezes a IA pode adicionar um texto antes/depois do JSON.
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
    
    // Validação básica da estrutura do plano
    if (!plan.macroName || !plan.explanation || !Array.isArray(plan.triggers) || !Array.isArray(plan.actions) || !Array.isArray(plan.constraints)) {
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
