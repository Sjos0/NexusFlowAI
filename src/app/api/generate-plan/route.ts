
// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import type { Message } from 'genkit/ai';
import type { Tool, ChatMessage, GeneratedPlan } from '@/lib/types';
import '../../../../genkit.config'; 

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

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem fornecida." }, { status: 400 });
    }

    const availableTools = `Gatilhos Disponíveis: ${formatTools(tools.triggers)}. Ações Disponíveis: ${formatTools(tools.actions)}. Restrições Disponíveis: ${formatTools(tools.constraints)}.`;

    const masterPrompt = `Você é Nexus, um arquiteto de automação criativo e um co-piloto especialista em MacroDroid. Sua tarefa é manter uma conversa útil e didática com o usuário, ajudando-o a construir a melhor automação possível. Você pode usar múltiplos gatilhos, ações e restrições. Lembre-se do histórico da conversa para refinar os planos. Sua resposta DEVE ser um objeto JSON VÁLIDO no formato que você já conhece (macroName, steps: [{type, toolName, chosenSubOptions, detailedSteps}]). Em "detailedSteps", use Markdown. Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas ou sub-opções o usuário deveria adicionar para viabilizar o plano.`;

    const genkitHistory: Message[] = messages.slice(0, -1).map((msg: ChatMessage): Message => {
      if (msg.role === 'user') {
        return { role: msg.role, content: [{ text: msg.content as string }] };
      } else {
        // Model content is a GeneratedPlan object
        const planContent = msg.content as GeneratedPlan;
        // For history, send a simplified summary of the AI's previous plan
        return { role: msg.role, content: [{ text: `Eu gerei um plano chamado "${planContent.macroName}". Detalhes do plano omitidos do histórico para brevidade.` }] };
      }
    });
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || typeof lastMessage.content !== 'string') {
        return NextResponse.json({ error: "A última mensagem deve ser do usuário e conter texto." }, { status: 400 });
    }
    const currentPromptText = lastMessage.content;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-05-20',
      system: `${masterPrompt}\n\nFerramentas disponíveis para este turno: ${availableTools}`, 
      history: genkitHistory, 
      prompt: currentPromptText, 
      config: { temperature: 0.6 },
    });
    
    const mainCandidate = llmResponse.candidates[0];
    if (!mainCandidate || mainCandidate.finishReason !== 'STOP') {
      const reason = mainCandidate?.finishReason || 'UNKNOWN_REASON';
      const message = mainCandidate?.message || 'Nenhuma mensagem disponível do LLM.';
      console.error(`Falha na geração do LLM. Razão: ${reason}. Mensagem: ${message}`, llmResponse);
      throw new Error(`Falha na geração da IA: ${reason}. ${message}`);
    }

    const responseTextRaw = mainCandidate.output?.text;
    if (typeof responseTextRaw !== 'string') {
      console.error('Resposta do LLM não continha uma saída de texto válida.', mainCandidate.output);
      throw new Error('A resposta da IA não continha texto utilizável.');
    }
    
    const responseText = responseTextRaw.replace(/```json/g, '').replace(/```/g, '').trim();
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
