// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Using the pre-configured ai object

export async function POST(req: NextRequest) {
  try {
    const { prompt, tools } = await req.json();

    const availableTools = `
      Gatilhos Disponíveis: ${tools.triggers.map((t: { name: string }) => t.name).join(', ') || 'Nenhum'}.
      Ações Disponíveis: ${tools.actions.map((a: { name: string }) => a.name).join(', ') || 'Nenhuma'}.
      Restrições Disponíveis: ${tools.constraints.map((c: { name: string }) => c.name).join(', ') || 'Nenhuma'}.
    `;

    const masterPrompt = `
      Você é um especialista em MacroDroid. Seu objetivo é analisar o pedido de um usuário e as ferramentas que ele tem e criar um plano de automação.

      **Sua resposta DEVE ser um objeto JSON VÁLIDO e NADA MAIS.**
      O JSON deve ter a seguinte estrutura:
      {
        "macroName": "Um nome curto e descritivo para a macro",
        "explanation": "Uma explicação em texto simples e didático de como a automação funciona.",
        "triggers": ["Nome exato do gatilho da lista de disponíveis"],
        "actions": ["Nome exato da ação 1", "Nome exato da ação 2"],
        "constraints": ["Nome exato da restrição, se aplicável"]
      }

      **REGRAS IMPORTANTES:**
      1. Use APENAS os nomes das ferramentas EXATAMENTE como aparecem nas listas de disponíveis.
      2. Se o pedido for impossível de fazer com as ferramentas atuais, os arrays devem vir vazios e a "explanation" deve dizer por que não é possível e o que o usuário precisa adicionar.
      3. Seja conciso.

      ---
      Ferramentas Disponíveis:
      ${availableTools}
      ---
      Pedido do usuário: "${prompt}"
      ---
      
      Gere o objeto JSON agora.
    `;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest', // Using a reliable model, can be changed to 'googleai/gemini-2.5-flash-preview-05-20' if preferred and available
      prompt: masterPrompt,
      config: { temperature: 0.2 },
    });

    // Extrair o JSON da resposta da IA
    // Remove markdown backticks if present
    const responseText = (llmResponse.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    let plan;

    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      throw new Error('A IA retornou uma resposta em formato JSON inválido.');
    }

    return NextResponse.json(plan);

  } catch (error) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = 'Ocorreu um erro ao gerar o plano JSON.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Retorna uma resposta de erro clara para o frontend
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? String(error) : null },
      { status: 500 }
    );
  }
}
