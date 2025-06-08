// src/lib/ai/wikiContext.ts

export const WIKI_CONTEXT = `
=== INÍCIO DO CONHECIMENTO FUNDAMENTAL MACRODROID ===

**CONCEITOS PRINCIPAIS:**
- Uma Macro é composta por três partes: um Gatilho, uma Ação e uma Restrição opcional.
- **Gatilho:** O evento que inicia a macro (ex: Bateria Baixa, Chamada Recebida, NFC). Múltiplos gatilhos podem ser usados; qualquer um deles ativará a macro.
- **Ação:** A tarefa que é executada quando a macro é ativada (ex: Enviar Notificação, Ligar WiFi, Abrir App). Múltiplas ações são executadas em sequência.
- **Restrição:** Uma condição que deve ser verdadeira para que as ações sejam executadas (ex: Dia da Semana, Nível de Bateria). Se a restrição for falsa, a macro não executa as ações, mesmo que o gatilho seja disparado.

**TIPOS DE GATILHOS COMUNS (Exemplos):**
- **Bateria & Energia:** Nível da Bateria, Carregador Conectado/Desconectado.
- **Conectividade:** WiFi Ativado/Desativado, Conectado a uma Rede Específica, Bluetooth.
- **Eventos do Dispositivo:** Tela Ligada/Desligada, Agitar Dispositivo, Dispositivo Invertido.
- **Localização:** Entrar/Sair de uma Área Geográfica.
- **Sensores:** Sensor de Luz, Sensor de Proximidade.
- **Chamadas & SMS:** Chamada Recebida, SMS Recebido.

**TIPOS DE AÇÕES COMUNS (Exemplos):**
- **Conectividade:** Ligar/Desligar WiFi, Ligar/Desligar Bluetooth, Ligar/Desligar Dados Móveis.
- **Som & Volume:** Definir Volume, Modo Silencioso/Vibração.
- **Tela:** Brilho da Tela, Tempo Limite da Tela, Ligar/Desligar Tela.
- **Comunicação:** Enviar Notificação, Enviar SMS, Fazer Chamada.
- **Lógica:** Esperar/Aguardar, Condição If/Else, Loop.
- **Avançado:** Requisição HTTP, Escrever em Arquivo, Executar Script Shell.

**VARIÁVEIS:**
- Variáveis são contêineres para armazenar dados. Elas podem ser criadas pelo usuário.
- **Tipos:** Booleano (verdadeiro/falso), Inteiro (números inteiros), String (texto), Decimal (números com casas decimais).
- **Uso:** Podem ser usadas em ações e restrições para criar lógicas dinâmicas. Por exemplo, uma ação de Requisição HTTP pode salvar o resultado em uma variável String, e uma ação de Notificação pode exibir o conteúdo dessa variável.

**PALAVRAS MÁGICAS (Magic Text):**
- Permite inserir informações dinâmicas em campos de texto. Por exemplo, ao enviar uma notificação, você pode usar o texto mágico para incluir o nível atual da bateria, o nome da rede WiFi conectada, ou a hora atual.

=== FIM DO CONHECIMENTO FUNDAMENTAL MACRODROID ===
`;
