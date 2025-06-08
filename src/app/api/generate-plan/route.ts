// src/app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit'; // Use the project's configured ai instance
import type { Tool, Variable, GeneratedPlan, PlanStep } from '@/lib/types'; 
import { WIKI_CONTEXT } from '@/lib/ai/wikiContext'; // Importe o novo conhecimento

const formatTools = (tools: Tool[]): string => {
  if (!tools || tools.length === 0) return 'Nenhuma';
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
    const { prompt: userQuery, tools } = await req.json() as { prompt: string; tools: { triggers: Tool[], actions: Tool[], constraints: Tool[], variables: Variable[] } };

    if (!userQuery) {
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
      Sua identidade é Nexus. Você é um especialista mundial em MacroDroid.
      Sua fonte de conhecimento primária e inalterável sobre o funcionamento do MacroDroid é o seguinte texto:
      --- CONHECIMENTO BASE ---
      ${WIKI_CONTEXT}
      --- FIM DO CONHECIMENTO BASE ---

      O usuário fornecerá uma lista de ferramentas e variáveis que ele pessoalmente cadastrou. Você deve usar essas ferramentas para construir a automação.

      **REGRAS DE OURO:**
      1.  **Use o CONHECIMENTO BASE como sua fonte da verdade.** Se o usuário pedir algo que contradiz o conhecimento base (ex: usar uma restrição como um gatilho), explique educadamente por que isso não é possível, citando o conceito correto.
      2.  **Construa o plano usando APENAS as ferramentas e variáveis do "Knowledge Base do Usuário".**
      3.  Se o usuário não tiver as ferramentas necessárias, use seu conhecimento base para sugerir quais ferramentas ele deveria criar (ex: "Para fazer isso, você precisará criar uma Ação do tipo 'Requisição HTTP' no seu Knowledge Base.").
      4.  Sua resposta DEVE ser um objeto JSON VÁLIDO no formato { macroName: string, steps: Array<{type: string, toolName: string, chosenSubOptions: string[], detailedSteps: string}> }. Em "detailedSteps", use Markdown.
      5. Se o pedido for impossível, o JSON DEVE ter "macroName": "Plano Impossível" e um único objeto no array "steps" com "type": "AÇÃO", "toolName": "Explicação", "chosenSubOptions": [], e "detailedSteps" explicando em Markdown por que não é possível e quais tipos de ferramentas, sub-opções ou variáveis o usuário deveria adicionar para viabilizar o plano.

      --- KNOWLEDGE BASE DO USUÁRIO ---
      ${userKnowledgeBase}
      --- FIM DO KNOWLEDGE BASE DO USUÁRIO ---
    `;
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-05-20', // Specific model for this call
      system: masterPrompt, // The master prompt is the System Prompt.
      prompt: `**PEDIDO DO USUÁRIO:** "${userQuery}"`, // User's actual query
      config: { temperature: 0.5 },
    });

    const responseTextRaw = llmResponse.text; // Genkit 1.x syntax
    if (!responseTextRaw) {
        throw new Error('LLM returned an empty response.');
    }
    const responseText = responseTextRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let plan: GeneratedPlan;
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
    plan.steps.forEach((step: PlanStep, index: number) => {
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
