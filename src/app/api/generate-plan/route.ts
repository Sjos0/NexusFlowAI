// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Use the project's configured ai instance
import type { Tool, Variable, ToolCategory } from '@/lib/types'; // Ensure ToolCategory is imported if needed by formatTools, though it's not directly used in the provided snippet.
import { WIKI_CONTEXT } from '@/lib/ai/wikiContext'; // Assume this file exists

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
    // A API agora recebe um único 'prompt' e 'tools'.
    const { prompt, tools } = await req.json() as { prompt: string; tools: { triggers: Tool[], actions: Tool[], constraints: Tool[], variables: Variable[] } };

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    if (!tools) {
      return NextResponse.json({ error: 'Tools data is required.' }, { status: 400 });
    }
    
    const userKnowledgeBase = `
      Gatilhos do Usuário: ${formatTools(tools.triggers || [])}.
      Ações do Usuário: ${formatTools(tools.actions || [])}.
      Restrições do Usuário: ${formatTools(tools.constraints || [])}.
      Variáveis do Usuário: ${formatVariables(tools.variables || [])}.
    `;

    const masterPrompt = `
      Sua identidade é Nexus, um especialista mundial em MacroDroid.
      Sua fonte da verdade é o CONHECIMENTO BASE. O usuário fornecerá um KNOWLEDGE BASE DO USUÁRIO.
      Seu objetivo é analisar o pedido do usuário e criar UM ÚNICO plano de automação completo e detalhado.

      --- CONHECIMENTO BASE ---
      ${WIKI_CONTEXT}
      --- FIM DO CONHECIMENTO BASE ---

      --- KNOWLEDGE BASE DO USUÁRIO ---
      ${userKnowledgeBase}
      --- FIM DO KNOWLEDGE BASE DO USUÁRIO ---

      **REGRAS DE OURO:**
      1. Use o CONHECIMENTO BASE para validar conceitos e sugerir ferramentas.
      2. Construa o plano usando APENAS o KNOWLEDGE BASE DO USUÁRIO.
      3. Sua resposta DEVE ser um objeto JSON VÁLIDO no formato { macroName: string, steps: Array<{type: string, toolName: string, chosenSubOptions: string[], detailedSteps: string}> }. Em "detailedSteps", use Markdown.
      4. Utilize as "Variáveis Disponíveis" para tornar as automações dinâmicas. Por exemplo, se uma ação pode usar uma variável, mostre como no passo a passo (ex: 'No campo de texto, insira o valor da variável {nome_da_variavel}').
      5. Respeite o tipo de cada variável. Não tente usar uma variável Booleana onde um texto é esperado.
      6. Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas, sub-opções ou variáveis o usuário deveria adicionar para viabilizar o plano.

      **PEDIDO DO USUÁRIO:** "${prompt}"
    `;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-05-20', // Specify the model here
      prompt: masterPrompt,
      config: { temperature: 0.5 },
    });

    const responseTextRaw = llmResponse.text; // Correct Genkit 1.x syntax
    if (!responseTextRaw) {
        throw new Error('LLM returned an empty response.');
    }
    const responseText = responseTextRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let plan;
    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      // Attempt to extract JSON if it's embedded
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          plan = JSON.parse(jsonMatch[0]);
        } catch (nestedParseError) {
          console.error("Erro ao parsear JSON extraído:", nestedParseError, "Conteúdo:", jsonMatch[0]);
          throw new Error('A IA retornou uma resposta em formato JSON inválido, mesmo após tentativa de extração.');
        }
      } else {
        throw new Error('A IA retornou uma resposta que não contém um objeto JSON válido.');
      }
    }
    
    // Basic validation of the plan structure
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: 'Falha ao gerar o plano JSON. Erro: ' + errorMessage }, { status: 500 });
  }
}
