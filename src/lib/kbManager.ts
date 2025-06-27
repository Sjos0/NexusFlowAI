// src/lib/kbManager.ts
import type { ToolsState } from '@/stores/useToolsStore';
import type { Tool, Variable, SubOption, Tela } from '@/lib/types';

type KnowledgeBaseData = Omit<ToolsState, 'hydrate' | 'addTool' | 'removeTool' | 'updateTool' | 'addVariable' | 'removeVariable' | 'updateVariable' | 'overwriteState'>;

// Function to generate the human-readable .txt file
const generateHumanReadableText = (data: KnowledgeBaseData): string => {
  let output = '### BANCO DE CONHECIMENTO NEXUSFLOW ###\n\n';
  
  const formatTool = (tool: Tool) => 
    `  - ${tool.name}\n${tool.subOptions.map((so: SubOption) => 
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

// Main Export Function
export const exportKnowledgeBase = (data: KnowledgeBaseData) => {
  // Create .txt file
  const textBlob = new Blob([generateHumanReadableText(data)], { type: 'text/plain;charset=utf-8' });
  const textUrl = URL.createObjectURL(textBlob);
  const textLink = document.createElement('a');
  textLink.href = textUrl;
  textLink.download = 'NexusFlow_Conhecimento.txt';
  document.body.appendChild(textLink);
  textLink.click();
  document.body.removeChild(textLink);
  URL.revokeObjectURL(textUrl);

  // Create .nexus file
  const jsonString = JSON.stringify(data);
  // Encode UTF-8 string to Base64:
  // 1. encodeURIComponent to handle multi-byte UTF-8 characters
  // 2. unescape to convert %XX sequences to single bytes (binary string)
  // 3. btoa to Base64 encode the binary string
  const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
  const nexusBlob = new Blob([encodedData], { type: 'application/octet-stream' });
  const nexusUrl = URL.createObjectURL(nexusBlob);
  const nexusLink = document.createElement('a');
  nexusLink.href = nexusUrl;
  nexusLink.download = 'NexusFlow_Backup.nexus';
  document.body.appendChild(nexusLink);
  nexusLink.click();
  document.body.removeChild(nexusLink);
  URL.revokeObjectURL(nexusUrl);
};

// Function to import the knowledge base from a human-readable .txt file
export const importKnowledgeBaseFromText = (text: string): KnowledgeBaseData => {
  const lines = text.split('\n');
  const data: KnowledgeBaseData = {
    triggers: [],
    actions: [],
    constraints: [],
    variables: [],
  };

  let currentSection: 'GATILHOS' | 'AÇÕES' | 'RESTRIÇÕES' | 'VARIÁVEIS' | null = null;
  let currentTool: Tool | null = null;
  let currentSubOption: SubOption | null = null;
  let lastLineWasTela = false; // To handle multiline Tela content

  for (const line of lines) {
    const trimmedLine = line.trimEnd();
    
    // Skip empty lines
    if (trimmedLine === '') {
      continue;
    }

    if (trimmedLine.startsWith('### BANCO DE CONHECIMENTO NEXUSFLOW ###')) {
      // Ignore header
      continue;
    }

    if (trimmedLine === '## GATILHOS') {
      currentSection = 'GATILHOS';
      currentTool = null;
      currentSubOption = null;
      continue;
    }
    if (trimmedLine === '## AÇÕES') {
      currentSection = 'AÇÕES';
      currentTool = null;
      currentSubOption = null;
      continue;
    }
    if (trimmedLine === '## RESTRIÇÕES') {
      currentSection = 'RESTRIÇÕES';
      currentTool = null;
      currentSubOption = null;
      continue;
    }
    if (trimmedLine === '## VARIÁVEIS') {
      currentSection = 'VARIÁVEIS';
      currentTool = null;
      currentSubOption = null;
      continue;
    }

    if (currentSection === 'VARIÁVEIS' && trimmedLine.startsWith('  - ')) {
      const varMatch = trimmedLine.match(/^  - (.*) \(Tipo: (.*)(, Segura)?\)$/);
      if (varMatch) {
        data.variables.push({
          id: `var-${Date.now()}-${Math.random()}`, // Generate a simple ID
          name: varMatch[1].trim(),
          type: varMatch[2].trim() as Variable['type'], // Assuming the type string matches the enum
          isSecure: !!varMatch[3],
        });
      }
    } else if (currentSection && ['GATILHOS', 'AÇÕES', 'RESTRIÇÕES'].includes(currentSection)) {
      if (trimmedLine.startsWith('  - ')) {
        currentTool = { id: `tool-${Date.now()}-${Math.random()}`, name: trimmedLine.substring(4).trim(), subOptions: [] };
        data[currentSection.toLowerCase() as 'triggers' | 'actions' | 'constraints'].push(currentTool);
        currentSubOption = null;
      } else if (currentTool && trimmedLine.startsWith('    - ')) {
        currentSubOption = { id: `sub-${Date.now()}-${Math.random()}`, name: trimmedLine.substring(6).trim(), telas: [] };
        currentTool.subOptions.push(currentSubOption);
      } else if (currentSubOption && trimmedLine.startsWith('      - Tela: ')) {
        currentSubOption.telas.push({ id: `tela-${Date.now()}-${Math.random()}`, content: trimmedLine.substring(14).trim() });
      }
    }
  }
  return data;
};
