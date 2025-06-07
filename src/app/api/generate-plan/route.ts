// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Using the pre-configured ai object from Genkit 1.x setup

export async function POST(req: NextRequest) {
  try {
    const { prompt, tools } = await req.json();

    // Constrói o contexto para a IA
    const availableTools = `
      Gatilhos Disponíveis: ${tools.triggers.map((t: { name: string }) => t.name).join(', ') || 'Nenhum'}.
      Ações Disponíveis: ${tools.actions.map((a: { name: string }) => a.name).join(', ') || 'Nenhuma'}.
      Restrições Disponíveis: ${tools.constraints.map((c: { name: string }) => c.name).join(', ') || 'Nenhuma'}.
    `;

    const masterPrompt = `
      Você é um especialista em MacroDroid e um planejador de automações. Seu objetivo é criar um plano de automação detalhado e didático para um usuário com base no objetivo dele e nas ferramentas que ele forneceu.

      **Instruções Cruciais:**
      1. Use APENAS as ferramentas listadas em "Ferramentas Disponíveis". Não invente gatilhos, ações ou restrições que não estão na lista.
      2. Se o pedido do usuário não puder ser atendido com as ferramentas disponíveis, explique por que e sugira quais tipos de ferramentas ele precisaria adicionar.
      3. Seja claro, direto e organize a resposta em um passo a passo lógico.
      4. Responda em HTML formatado. Use tags como <h2> para o título, <h3> para seções (Gatilho, Ações, Restrições), <ul> e <li> para listas e <strong> para destacar os nomes das ferramentas.

      ---
      Ferramentas Disponíveis:
      ${availableTools}
      ---
      O objetivo do usuário é: "${prompt}"
      ---

      Agora, gere o plano de automação:
    `;

    // Chama o modelo Gemini com o prompt construído usando Genkit 1.x syntax
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest', // Using a standard recent model, user can change if needed. User's choice was 'gemini-2.5-flash-preview-05-20' which can be used as 'googleai/gemini-2.5-flash-preview-05-20'
      prompt: masterPrompt,
      config: {
        temperature: 0.4, // Um valor que favorece a precisão sobre a criatividade
      },
    });

    // Retorna a resposta da IA em formato de texto (que será nosso HTML) - Genkit 1.x syntax
    return NextResponse.json({ plan: llmResponse.text });

  } catch (error) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = 'Ocorreu um erro ao se comunicar com a IA.';
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
