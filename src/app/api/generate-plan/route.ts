// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generate } from 'genkit/ai'; // Direct import for generate
import { googleAI } from '@genkit-ai/googleai'; // Corrected import for googleAI model provider
import type { Tool, Variable, PlanStep, GeneratedPlan } from '@/lib/types'; // Ensure all necessary types are here
import { WIKI_CONTEXT } from '@/lib/ai/wikiContext';

const formatTools = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhuma';
  return tools.map(t => {
    const subOptionsString = t.subOptions.map(so => {
      const telasString = so.telas.map(tela => tela.content).join('; ');
      // Changed "Contexto Telas:" to "Contexto:"
      return `${so.name}${telasString ? ` (Contexto: ${telasString})` : ''}`; 
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
    const { prompt: userQuery, tools } = await req.json() as { prompt: string; tools: { triggers: Tool[], actions: Tool[], constraints: Tool[], variables: Variable[] } };

    if (!userQuery) {
      // Updated error message
      return NextResponse.json({ error: 'O prompt é obrigatório.' }, { status: 400 });
    }
    if (!tools) {
        return NextResponse.json({ error: 'Tools data is required.' }, { status: 400 });
    }

    const userKnowledgeBase = `
--- KNOWLEDGE BASE DO USUÁRIO ---
Gatilhos do Usuário: ${formatTools(tools.triggers || [])}.
Ações do Usuário: ${formatTools(tools.actions || [])}.
Restrições do Usuário: ${formatTools(tools.constraints || [])}.
Variáveis do Usuário: ${formatVariables(tools.variables || [])}.
--- FIM DO KNOWLEDGE BASE DO USUÁRIO ---
`;

    const finalPrompt = `
Sua identidade é Nexus, um especialista mundial em MacroDroid.
Sua fonte de conhecimento primária e inalterável sobre o funcionamento do MacroDroid está no texto dentro de "--- CONHECIMENTO BASE ---".
Seu objetivo é analisar o "PEDIDO DO USUÁRIO" e criar UM ÚNICO plano de automação completo e detalhado, usando as ferramentas do "KNOWLEDGE BASE DO USUÁRIO".

**REGRAS DE OURO:**
1. Use o CONHECIMENTO BASE como sua fonte da verdade.
2. Construa o plano usando APENAS as ferramentas do KNOWLEDGE BASE DO USUÁRIO.
3. Se o usuário não tiver as ferramentas necessárias, use seu conhecimento base para sugerir quais ferramentas ele deveria criar (ex: "Para fazer isso, você precisará criar uma Ação do tipo 'Requisição HTTP' no seu Knowledge Base.").
4. Sua resposta DEVE ser um objeto JSON VÁLIDO e NADA MAIS, no formato { "macroName": string, "steps": [{ "type": "GATILHO" | "AÇÃO" | "RESTRIÇÃO", "toolName": string, "chosenSubOptions": string[], "detailedSteps": "string em formato Markdown" }] }. Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas, sub-opções ou variáveis o usuário deveria adicionar para viabilizar o plano.

--- CONHECIMENTO BASE ---
${WIKI_CONTEXT}
--- FIM DO CONHECIMENTO BASE ---

${userKnowledgeBase}

--- PEDIDO DO USUÁRIO ---
"${userQuery}"
--- FIM DO PEDIDO DO USUÁRIO ---

Gere o objeto JSON agora.
`;
    
    const llmResponse = await generate({
      model: googleAI('gemini-2.5-flash-preview-05-20'), // Using direct googleAI provider
      prompt: finalPrompt,
      config: { temperature: 0.4 },
    });

    const responseTextRaw = llmResponse.text(); // Genkit 1.x syntax
    if (!responseTextRaw) {
        throw new Error('LLM returned an empty response.');
    }
    const responseText = responseTextRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let plan: GeneratedPlan;
    try {
      plan = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "Texto recebido:", responseText);
      const jsonMatch = responseText.match(/{[\s\S]*}/); // Try to extract JSON from a larger string
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
    plan.steps.forEach((step: PlanStep, index: number) => {
        if (!step.type || !step.toolName || !Array.isArray(step.chosenSubOptions) || typeof step.detailedSteps !== 'string') {
            console.error(`Estrutura do passo ${index} inválida:`, step);
            throw new Error(`A IA retornou um plano com um passo (${index}) malformado.`);
        }
    });

    return NextResponse.json(plan);

  } catch (error: any) {
    console.error("Erro na API /api/generate-plan:", error);
    let errorMessage = "Ocorreu um erro desconhecido";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    // Log the AI's raw response text if available, especially for parsing errors
    if (error.message && error.message.toLowerCase().includes('json') && error.cause && error.cause.candidates) {
        try {
            // @ts-ignore
            console.error("Resposta textual da IA que pode ter causado o erro de parse:", error.cause.candidates[0]?.content.parts[0].text);
        } catch (logError) {
            console.error("Erro ao tentar logar a resposta da IA:", logError);
        }
    } else if (error.responseText) { // Fallback for other types of errors that might carry the text
      console.error("Resposta textual da IA que pode ter causado o erro:", error.responseText);
    }
    
    return NextResponse.json(
      { error: 'Falha ao gerar o plano JSON. Erro: ' + errorMessage },
      { status: 500 }
    );
  }
}
