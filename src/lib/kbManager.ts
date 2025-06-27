// src/lib/kbManager.ts
import type { StoredState } from '@/stores/useToolsStore';
import type { Tool, Variable, SubOption, Tela, VariableType } from '@/lib/types';

// Function to generate the human-readable text for copying
export const generateKnowledgeBaseText = (data: StoredState): string => {
  let output = '### BANCO DE CONHECIMENTO NEXUSFLOW ###\n\n';

  const formatTool = (tool: Tool): string => {
    let toolString = `  - ${tool.name}\n`;
    if (tool.subOptions && tool.subOptions.length > 0) {
      toolString += tool.subOptions.map((so: SubOption) => {
        let subOptionString = `    - ${so.name}\n`;
        if (so.telas && so.telas.length > 0) {
          subOptionString += so.telas.map((t: Tela) =>
            // Ensure content is a single line for easier parsing
            `      - Tela: ${t.content.replace(/\n/g, ' ')}\n`
          ).join('');
        }
        return subOptionString;
      }).join('');
    }
    return toolString;
  };

  const formatVariable = (v: Variable): string =>
    `  - ${v.name} (Tipo: ${v.type}${v.isSecure ? ', Segura' : ''})\n`;

  output += '## GATILHOS\n';
  if (data.triggers && data.triggers.length > 0) {
    output += data.triggers.map(formatTool).join('');
  } else {
    output += '  (Nenhum gatilho definido)\n';
  }

  output += '\n## AÇÕES\n';
  if (data.actions && data.actions.length > 0) {
    output += data.actions.map(formatTool).join('');
  } else {
    output += '  (Nenhuma ação definida)\n';
  }

  output += '\n## RESTRIÇÕES\n';
  if (data.constraints && data.constraints.length > 0) {
    output += data.constraints.map(formatTool).join('');
  } else {
    output += '  (Nenhuma restrição definida)\n';
  }

  output += '\n## VARIÁVEIS\n';
  if (data.variables && data.variables.length > 0) {
    output += data.variables.map(formatVariable).join('');
  } else {
    output += '  (Nenhuma variável definida)\n';
  }

  return output;
};

// Function to import the knowledge base from text
export const importKnowledgeBaseFromText = (text: string): StoredState => {
  const lines = text.split('\n');
  const data: StoredState = {
    triggers: [],
    actions: [],
    constraints: [],
    variables: [],
  };

  let currentSection: 'triggers' | 'actions' | 'constraints' | 'variables' | null = null;
  let currentTool: Tool | null = null;
  let currentSubOption: SubOption | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '' || trimmedLine.startsWith('###')) continue;

    if (line.startsWith('## GATILHOS')) { currentSection = 'triggers'; currentTool = null; continue; }
    if (line.startsWith('## AÇÕES')) { currentSection = 'actions'; currentTool = null; continue; }
    if (line.startsWith('## RESTRIÇÕES')) { currentSection = 'constraints'; currentTool = null; continue; }
    if (line.startsWith('## VARIÁVEIS')) { currentSection = 'variables'; currentTool = null; continue; }

    if (!currentSection || trimmedLine.startsWith('(Nenhum')) continue;

    const indentation = line.search(/\S|$/);
    const content = line.trim();

    try {
        if (currentSection === 'variables') {
            if (indentation === 2 && content.startsWith('- ')) {
                const varContent = content.substring(2);
                const match = varContent.match(/^(.*?) \(Tipo: (Booleano|Inteiro|String|Decimal|Dicionário|Lista)(, Segura)?\)$/);
                if (match) {
                    data.variables.push({
                        id: crypto.randomUUID(),
                        name: match[1].trim(),
                        type: match[2] as VariableType,
                        isSecure: !!match[3],
                        description: '',
                    });
                }
            }
        } else { // Triggers, Actions, Constraints
            if (indentation === 2 && content.startsWith('- ')) { // Tool
                currentTool = {
                    id: crypto.randomUUID(),
                    name: content.substring(2).trim(),
                    subOptions: []
                };
                data[currentSection].push(currentTool);
                currentSubOption = null;
            } else if (currentTool && indentation === 4 && content.startsWith('- ')) { // SubOption
                currentSubOption = {
                    id: crypto.randomUUID(),
                    name: content.substring(2).trim(),
                    telas: []
                };
                currentTool.subOptions.push(currentSubOption);
            } else if (currentSubOption && indentation === 6 && content.startsWith('- Tela: ')) { // Tela
                currentSubOption.telas.push({
                    id: crypto.randomUUID(),
                    content: content.substring(8).trim()
                });
            }
        }
    } catch (e) {
        console.error("Error parsing line:", line, e);
        // Silently continue or throw specific error
    }
  }

  const totalItems = data.triggers.length + data.actions.length + data.constraints.length + data.variables.length;
   if (totalItems === 0 && !text.includes('(Nenhum')) {
      throw new Error("Formato de texto inválido ou o texto não contém dados para importar.");
   }

  return data;
};
