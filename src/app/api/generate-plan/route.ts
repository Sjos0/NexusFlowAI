// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai'; // Corrected import
import type { Message } from 'genkit/ai'; // Correct type for Genkit messages
import type { Tool, ChatMessage, GeneratedPlan } from '@/lib/types';
// The user explicitly asked for this import.
// It typically loads genkit.config.ts if it has side effects like configureGenkit()
// which is important if the API key or other configs are set there.
import '../../../../genkit.config'; 

// This function correctly includes sub-option and tela context
const formatTools = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhum';
  return tools.map(t => {
    const subOptionsString = t.subOptions.map(so => {
      const telasString = so.telas.map(tela => tela.content).join('; ');
      return `${so.name}${telasString ? ` (Contexto Telas: ${telasString})` : ''}`;
    }).join(', ');
    return `${t.name}${subOptionsString ? ` (Opções: ${subOptionsString})` : ''}`;
  }).join(' | ');
};

export async function POST(req: NextRequest) {
  try {
    const { messages, tools } = await req.json() as { messages: ChatMessage[], tools: { triggers: Tool[], actions: Tool[], constraints: Tool[] } };

    const availableTools = `Gatilhos Disponíveis: ${formatTools(tools.triggers)}. Ações Disponíveis: ${formatTools(tools.actions)}. Restrições Disponíveis: ${formatTools(tools.constraints)}.`;

    const masterPrompt = `Você é Nexus, um arquiteto de automação criativo e um co-piloto especialista em MacroDroid. Sua tarefa é manter uma conversa útil e didática com o usuário, ajudando-o a construir a melhor automação possível. Você pode usar múltiplos gatilhos, ações e restrições. Lembre-se do histórico da conversa para refinar os planos. Sua resposta DEVE ser um objeto JSON VÁLIDO no formato que você já conhece (macroName, steps: [{type, toolName, chosenSubOptions, detailedSteps}]). Em "detailedSteps", use Markdown. Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas ou sub-opções o usuário deveria adicionar para viabilizar o plano.`;

    const history: Message[] = messages.map((msg: ChatMessage): Message => {
      if (msg.role === 'user') {
        return { role: msg.role, content: [{ text: msg.content as string }] };
      } else {
        // Model content is a GeneratedPlan object
        const planContent = msg.content as GeneratedPlan;
        // For history, send a simplified summary of the AI's previous plan
        return { role: msg.role, content: [{ text: `Eu gerei um plano chamado "${planContent.macroName}". Detalhes do plano omitidos do histórico para brevidade.` }] };
      }
    });
    
    let currentPromptText = '';
    if (history.length > 0) {
        const lastMessage = history.pop(); // Remove the last message to treat it as the current prompt
        if (lastMessage && lastMessage.role === 'user' && lastMessage.content[0]?.text) {
            currentPromptText = lastMessage.content[0].text;
        } else if (lastMessage) {
            // If the last message was AI's or malformed, put it back for now, though this case might need more handling
            history.push(lastMessage); 
        }
    }
    
    if (!currentPromptText && messages.length > 0 && messages[messages.length-1].role === 'user') {
        currentPromptText = messages[messages.length-1].content as string;
    }


    if (!currentPromptText) {
        // Fallback or error if there's no current user prompt to process
        // This might happen if history was empty or only contained AI messages
        return NextResponse.json({ error: "Nenhum prompt de usuário atual encontrado para processar." }, { status: 400 });
    }
    
    const llmResponse = await generate({
      model: googleAI('gemini-2.5-flash-preview-05-20'), // Using corrected googleAI
      system: `${masterPrompt}\n\nFerramentas disponíveis para este turno: ${availableTools}`, // Add available tools to system prompt
      history: history, // Pass the modified history (without the last user message)
      prompt: currentPromptText, // The last user message
      config: { temperature: 0.6 },
    });
    
    const responseText = (llmResponse.text() || '').replace(/```json/g, '').replace(/```/g, '').trim();
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
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? String(error) : null },
      { status: 500 }
    );
  }
}
