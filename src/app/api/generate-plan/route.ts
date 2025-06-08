
// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import type { Message } from 'genkit/ai';
import type { Tool, ChatMessage, GeneratedPlan, Variable, ToolCategory } from '@/lib/types'; // Added ToolCategory

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

const formatVariables = (variables: Variable[]): string => {
  if (!variables || variables.length === 0) return 'Nenhuma';
  return variables.map(v => `${v.name} (Tipo: ${v.type}${v.isSecure ? ', Segura' : ''}${v.description ? `, Desc: ${v.description}` : ''})`).join('; ');
};

export async function POST(req: NextRequest) {
  try {
    const { messages, tools } = await req.json() as { messages: ChatMessage[], tools: { triggers: Tool[], actions: Tool[], constraints: Tool[], variables: Variable[] } };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem fornecida." }, { status: 400 });
    }
    
    const availableToolsAndVariables = `Gatilhos Disponíveis: ${formatTools(tools.triggers)}. Ações Disponíveis: ${formatTools(tools.actions)}. Restrições Disponíveis: ${formatTools(tools.constraints)}. Variáveis Disponíveis: ${formatVariables(tools.variables)}.`;

    const masterPrompt = `Você é Nexus, um arquiteto de automação criativo e um co-piloto especialista em MacroDroid. Sua tarefa é manter uma conversa útil e didática com o usuário, ajudando-o a construir a melhor automação possível. Você pode usar múltiplos gatilhos, ações e restrições. Lembre-se do histórico da conversa para refinar os planos. Sua resposta DEVE ser um objeto JSON VÁLIDO no formato que você já conhece (macroName, steps: [{type, toolName, chosenSubOptions, detailedSteps}]). Em "detailedSteps", use Markdown.
    
    **REGRAS CRÍTICAS:**
    - Utilize as "Variáveis Disponíveis" para tornar as automações dinâmicas. Por exemplo, se uma ação pode usar uma variável, mostre como no passo a passo (ex: 'No campo de texto, insira o valor da variável {nome_da_variavel}').
    - Respeite o tipo de cada variável. Não tente usar uma variável Booleana onde um texto é esperado.
    - Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas, sub-opções ou variáveis o usuário deveria adicionar para viabilizar o plano.`;

    const genkitHistory: Message[] = messages.slice(0, -1).map((msg: ChatMessage): Message => {
      if (msg.role === 'user') {
        return { role: msg.role, content: [{ text: msg.content as string }] };
      } else { // model role
        const planContent = msg.content as GeneratedPlan;
        // Summarize model responses to save tokens and keep context focused
        return { role: msg.role, content: [{ text: `Eu gerei um plano chamado "${planContent.macroName}". Detalhes omitidos.` }] };
      }
    });
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || typeof lastMessage.content !== 'string') {
        return NextResponse.json({ error: "A última mensagem deve ser do usuário e conter texto." }, { status: 400 });
    }
    const currentPromptText = lastMessage.content;

    // Combine system instructions, available tools/variables, and current user prompt
    const contextualInformation = `\n\nFERRAMENTAS E VARIÁVEIS DISPONÍVEIS PARA ESTA TAREFA:\n${availableToolsAndVariables}\n\n`;
    const userRequestHeader = `COM BASE NO HISTÓRICO DA CONVERSA (se houver, fornecido separadamente) E NAS FERRAMENTAS E VARIÁVEIS ACIMA, ATENDA AO SEGUINTE PEDIDO DO USUÁRIO:\n`;
    
    const fullPromptForLLM = `${masterPrompt}${contextualInformation}${userRequestHeader}${currentPromptText}`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-05-20',
      // The 'system' parameter is removed. System instructions are now part of 'fullPromptForLLM'.
      history: genkitHistory, 
      prompt: fullPromptForLLM, 
      config: { temperature: 0.6 },
    });
    
    const mainCandidate = llmResponse.candidates[0];
    if (!mainCandidate || mainCandidate.finishReason !== 'STOP' || !mainCandidate.output?.text) {
      const reason = mainCandidate?.finishReason || 'UNKNOWN_REASON';
      const messageText = mainCandidate?.output?.text || 'Nenhuma mensagem de saída do LLM.';
      console.error(`Falha na geração do LLM. Razão: ${reason}. Saída: ${messageText}`, llmResponse);
      // Send a more specific error if possible, otherwise generic.
      const detail = llmResponse.candidates.map(c => `Candidate finish: ${c.finishReason}, Message: ${c.finishMessage || 'N/A'}`).join('; ');
      const errorMessage = `Falha na geração da IA: ${reason}. ${messageText}. Details: ${detail}`;
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const responseTextRaw = mainCandidate.output.text;
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
          console.error("Erro ao parsear JSON extraído:", nestedParseError, "Conteúdo:", jsonMatch[0]);
          return NextResponse.json({ error: 'A IA retornou uma resposta em formato JSON inválido, mesmo após tentativa de extração.' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'A IA retornou uma resposta que não contém um objeto JSON válido.' }, { status: 500 });
      }
    }

    if (!plan.macroName || !Array.isArray(plan.steps)) {
        console.error("Estrutura do plano inválida recebida da IA:", plan);
        return NextResponse.json({ error: 'A IA retornou um plano com formato JSON esperado, mas com campos ausentes ou tipos incorretos.' }, { status: 500 });
    }
     plan.steps.forEach((step: any, index: number) => {
        if (!step.type || !step.toolName || !Array.isArray(step.chosenSubOptions) || typeof step.detailedSteps !== 'string') {
            console.error(`Estrutura do passo ${index} inválida:`, step);
            return NextResponse.json({ error: `A IA retornou um plano com um passo (${index}) malformado.` }, { status: 500 });
        }
    });

    return NextResponse.json(plan);

  } catch (error) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = 'Ocorreu um erro ao gerar o plano JSON.';
    if (error instanceof Error) {
        errorMessage = error.message; // This will be "system role is not supported" if that's the root cause from Genkit
    }
    // Ensure the error response is always JSON
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? String(error.stack) : "Detalhes não disponíveis" },
      { status: 500 }
    );
  }
}

