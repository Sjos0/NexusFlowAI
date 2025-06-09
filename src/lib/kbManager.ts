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
