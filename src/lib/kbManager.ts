// src/lib/kbManager.ts
import type { StoredState } from '@/stores/useToolsStore';
import type { Tool, Variable, SubOption, Tela } from '@/lib/types';

// Function to generate the human-readable .txt file string
const generateHumanReadableText = (data: StoredState): string => {
  let output = '### BANCO DE CONHECimento NEXUSFLOW ###\n\n';
  
  const formatTool = (tool: Tool) => 
    `  - ${tool.name}\n${(tool.subOptions || []).map((so: SubOption) => 
      `    - ${so.name}\n${(so.telas || []).map((t: Tela) => 
        `      - Tela: ${t.content.replace(/\n/g, ' ')}\n`).join('')}`).join('')}`;
  
  const formatVariable = (v: Variable) => 
    `  - ${v.name} (Tipo: ${v.type}${v.isSecure ? ', Segura' : ''})\n`;

  output += '## GATILHOS\n';
  if (data.triggers.length > 0) {
    output += data.triggers.map(formatTool).join('');
  } else {
    output += '  (Nenhum gatilho definido)\n';
  }
  
  output += '\n## AÇÕES\n';
  if (data.actions.length > 0) {
    output += data.actions.map(formatTool).join('');
  } else {
    output += '  (Nenhuma ação definida)\n';
  }

  output += '\n## RESTRIÇÕES\n';
  if (data.constraints.length > 0) {
    output += data.constraints.map(formatTool).join('');
  } else {
    output += '  (Nenhuma restrição definida)\n';
  }
  
  output += '\n## VARIÁVEIS\n';
  if (data.variables.length > 0) {
    output += data.variables.map(formatVariable).join('');
  } else {
    output += '  (Nenhuma variável definida)\n';
  }

  return output;
};

// Renamed from exportKnowledgeBase
export const generateKnowledgeBaseText = (data: StoredState): string => {
  return generateHumanReadableText(data);
};

// Function to import the knowledge base from a human-readable .txt file
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
    if (line.trim() === '' || line.startsWith('###')) continue;

    if (line.startsWith('## GATILHOS')) { currentSection = 'triggers'; currentTool = null; continue; }
    if (line.startsWith('## AÇÕES')) { currentSection = 'actions'; currentTool = null; continue; }
    if (line.startsWith('## RESTRIÇÕES')) { currentSection = 'constraints'; currentTool = null; continue; }
    if (line.startsWith('## VARIÁVEIS')) { currentSection = 'variables'; currentTool = null; continue; }
    
    if (!currentSection || line.trim().startsWith('(Nenhum')) continue;
    
    const indentation = line.search(/\S|$/);
    const content = line.trim();

    if (currentSection === 'variables') {
      if (indentation === 2 && content.startsWith('- ')) {
        const varContent = content.substring(2);
        const match = varContent.match(/^(.*) \(Tipo: (Booleano|Inteiro|String|Decimal|Dicionário|Lista)(, Segura)?\)$/);
        if (match) {
          data.variables.push({
            id: crypto.randomUUID(),
            name: match[1].trim(),
            type: match[2] as Variable['type'],
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
  }

  const totalItems = data.triggers.length + data.actions.length + data.constraints.length + data.variables.length;
   if (totalItems === 0 && !text.includes('(Nenhum')) {
      throw new Error("Formato de texto inválido ou o texto não contém dados para importar.");
   }

  return data;
};
