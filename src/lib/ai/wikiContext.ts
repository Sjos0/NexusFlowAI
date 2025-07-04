// src/lib/ai/wikiContext.ts

export const WIKI_CONTEXT = `
### BANCO DE CONHECIMENTO NEXUSFLOW ###

## GATILHOS
  - Aplicativos
    - Aplicativo aberto/fechado
      - Tela: Tela 1:  Selecione uma opção  [ ]   Aplicativo aberto [ ]   Aplicativo fechado  ( ) Forçar mecanismo antigo:  Tente esta opção se você tiver problemas com a implementação do novo gatilho de aplicativo aberto ou se não quiser que o MacroDroid obtenha permissão de acessibilidade.  CANCELAR | OK
      - Tela: Tela 2: Ex.: [ X ] Aplicativo Aberto  Selecione uma opção  [ ] Selecionar Aplicativo(a) [ ] Digite o nome do pacote  CANCELAR | OK  ---  Obs: Todas as telas após a tela 1 em todas as sub opções são telas exemplares, com o intuito de instruir a IA como seria a próxima tela após a tela 1, para criar um plano mais conciso e real e detalhado  O Macrodroid Permite múltiplos gatilhos, ações e restrições numa única macro, bem como permite gatilhos, ações e restrições repetidas.
      - Tela: Tela 3: [ X ] Selecionar Aplicativo(s)  Selecionar Aplicativo(s)  [...Lista de aplicativos selecionáveis...]  ( ) Exibir aplicativos não executáveis  TUDO   | CANCELAR | OK
    - Aplicativo instalado/desinstalado/atualizado
    - Clique na IU
    - Conteúdo da captura de ecrã
    - Conteúdo da tela
    - Plugin Tasker/Locale
    - Spotify
    - Texto partilhado com o MacroDroid
  - Bateria/Potência
    - Botão lateral pressionado várias vezes
    - Carregador conectado/desconectado
    - Estado da Economia de Bateria
    - Nível da bateria
    - Temperatura da bateria
  - Chamadas/SMS
    - Chamada ativa
    - Chamada efetuada
    - Chamada encerrada
    - Chamada perdida
    - Chamada recebida
    - Número de telefone discado
    - SMS enviado
    - SMS recebido
  - Conectividade
    - Android Wear
    - Beacon dentro/fora do alcance
    - Conectividade com internet modificada
    - Dispositivo USB conectado/desconectado
    - Estado do Bluetooth
    - Fone de ouvido inserido/removido
    - Mudança de Estado do Wi-Fi
    - Mudança de endereço IP
    - Mudança de estado do VPN
    - Pedido do servidor HTTP
    - Ponto de acesso habilitado/desabilitado
    - Roaming iniciado/interrompido
    - Status do sinal de celular
    - Webhook (URL)
    - Wi-Fi dentro/fora do alcance
  - Data/Hora
    - Cronômetro
    - Dia da semana/mês
    - Evento de calendário
    - Gatilho de dia/hora
    - Intervalo regular
    - Nascer/Pôr do sol
  - Específico do MacroDroid
    - Alteração do Modo MacroDroid
    - Barra lateral aberta/fechada
    - Bloco das configurações rápidas
    - Botão da barra de notificação
    - Entrada de registro do sistema
    - Gatilho vazio
    - Macro concluída
    - Macro habilitada
    - MacroDroid inicializado
    - Variável do MacroDroid modificada
  - Eventos do Dispositivo
    - Auto-sincronização modificada
    - Daydream ligado/desligado
    - Dispositivo dentro/fora do dock
    - Dispositivo inicializado
    - Falha na tentativa de desbloqueio
    - Foto tirada
    - GPS ativado/desativado
    - Intent recebido
    - Mensagem do Logcat
    - Modo Avião Alterado
    - Modo Prioritário / Não Perturbe
    - Modo Silencioso Ativado/Desativado
    - Mudança do cartão SIM
    - Mudança em configuração de sistema
    - Música/Som tocando
    - Notificação
    - Rotação automática modificada
    - Tela desbloqueada
    - Tela ligada/desligada
    - Troca do tema Escuro
    - Área de transferência modificada
  - Interação do Usuário
    - Atalho iniciado
    - Botão de Mídia V2
    - Botão de mídia pressionado
    - Botão de volume pressionado
    - Botão de widget pressionado
    - Botão flutuante
    - Deslize na tela
    - Gesto de impressão digital
    - Google Assistente
    - Pressionamento longo do botão Home
    - Pressionamento longo do botão de volume
    - Pressão longa do botão liga / desliga
  - Localização
    - Localização
    - Perímetro geográfico
    - Tempo
    - Torre de celular modificada
  - Sensores
    - Atividade reconhecida
    - Dispositivo agitado
    - Dispositivo virado
    - Orientação da tela
    - Sensor de luz
    - Sensor de proximidade
      - Tela: Tela 1  * Selecione uma opção  [ ] Aproximado [ ] Afastado [ ] Aceno lento [ ] Aceno rápido  CANCELAR | OK
    - Sono

## AÇÕES
  - Ações do dispositivo
    - Abrir tela inicial
    - Autenticar usuário
      - Tela: Tela 1:  Autenticar Usuário  Título: [Título...] | [...] -> Botão com lista de palavras mágicas somente entre "{ }"  Legenda: [Legenda...] | [...]  Salvar em variável \/ -> (Botão de seta pra baixo para abrir lista de variáveis criadas) | "+" -> (Botão para criar uma nova variável)  [ ] Permitir PIN / Padrão  CANCELAR | OK
    - Entrada de voz
    - Expandir/recolher a barra de status
    - Falar texto
    - Interação com UI
    - Ligar/desligar a Lanterna
    - Obter nível de luz
    - Partilhar texto
    - Pesquisa de voz
    - Preencher a área de transferência
    - Pressionar o botão voltar
    - Recarregar área de transferência
    - Recursos do Android
    - Vibrar
  - Aplicativos
    - Abrir aplicativo
    - Abrir site
    - Código JavaScript
    - Fechar aplicativo em segundo plano
    - Iniciar atalho
    - Iniciar atividade da aplicação
    - Obter aplicações instaladas
    - Plugin Tasker/Locale
    - Script de Shell
  - Arquivos
    - Abrir arquivo
    - Escrever em arquivo
    - Gerenciar arquivo
    - Ler de arquivo
  - Câmera/Foto
    - Abrir última foto
    - Capturar a tela
    - Compartilhar última foto
    - Habilitar/Desabilitar Câmera
    - Tirar foto
  - Condições/Loops
    - Condição Se
      - Tela: Tela 1:  Condição Se  Adicione uma ou mais condições que devem ser satisfeitas em sequência para que as ações dentro da cláusula "Se" sejam executadas.  Condições | +  [Lista de condições adicionadas]  ( ) Não registrar falha se a condição não for satisfeita  CANCELAR | OK  ---  Obs: Se a lista de condições for mais de uma ao lado do "+" na mesma tela aparecerá um "OU" e um "E" para escolher.
      - Tela: Tela especial:  Em ações se clicar na condição "Se" terá essas opções na tela em pop-up:  - Configurar - Condição de ensaio - Adicionar ação acima - Adicionar ação dependente - Adicionar cláusula senão/se - Adicionar cláusula senão/se confirmada - Adicionar comentário - Recortar - Copiar - Colar ação acima - Extrair para blocos de ações - Excluir - Excluir (Inclusive dependentes) - Desativar - Desativar (Inclusive dependentes) - Ajuda
    - Confirmar próxima ação
    - Continuar o loop
    - Iterar Dicionário/Lista
    - Parada do loop
    - Repetir ações
    - Se confirmado então
  - Conectividade
    - Android Wear
    - Ativar/desativar modo avião
    - Checar conectividade
    - Configurar Bluetooth
    - Configurar Wi-Fi
    - Enviar intent
    - Ligar/Desligar ponto de acesso
    - Ligar/desligar dados móveis
    - Ligar/desligar sincronização automática
    - Sincronizar conta
  - Configurações do dispositivo
    - Aplicativo "Secure Settings"
    - Ativar Daydream/Protetor de Tela
    - Configurar bloco nas configurações rápidas
    - Configurar o bloqueio de tela
    - Configuração do Sistema
    - Definir assistente digital
    - Definir papel de parede
    - Densidade do ecrã
    - Economia de Bateria
    - Escala de Fonte
    - Inverter Cores
    - Ligar/desligar a rotação automática
    - Modo Carro
    - Modo de demonstração
    - Modo imersivo
    - Selecionar teclado
    - Serviço de Acessibilidade
    - Teclado - Definir padrão
    - Tela ambiente
    - Tema Escuro
  - Data/Hora
    - Cronômetro
    - Despertador
    - Dizer a hora atual
  - Específico do MacroDroid
    - Ativar/Desativar categoria
    - Ativar/desativar gatilho
    - Ação Vazia
    - Barra lateral do MacroDroid
    - Caixa de diálogo de opções
    - Caixa de diálogo de seleção
    - Configurar Botão Flutuante
    - Configurações do MacroDroid
    - Definir o modo do MacroDroid
    - Definir o texto da notificação do MacroDroid
    - Definir ícone do MacroDroid
    - Definir ícone na barra de botões
    - Desabilitar Macrodroid
    - Esperar por disparo
    - Exportar macros
    - Limpar caixa de diálogo MacroDroid
    - Manipular texto
    - Modificar botão de widget
    - Texto flutuante
    - Traduzir texto
  - Interação Web
    - Comando UDP
    - Processar JSON
    - Produzir JSON
    - Requisição HTTP
    - Resposta do servidor HTTP
  - Localização
    - Compartilhar localização
    - Definir frequência de atualização do local
    - Forçar atualização do local
    - Modo da localização
  - Macros
    - Aguardar antes da próxima ação
    - Ativar/Desativar macro
    - Bloco de ações
    - Cancelar ações de macro
    - Excluir macro
    - Executar macro
  - Mensagem
    - Enviar SMS
    - Enviar e-mail
    - Enviar via WhatsApp (Beta)
  - Mídia
    - Controlar mídia
    - Gravar do microfone
    - Reproduzir/Parar som
  - Notificação
    - Ativar/Desativar LED de notificação
    - Ativar/Desativar heads-up
    - Definir som de notificação
    - Exibir caixa de diálogo
    - Exibir notificação
    - Exibir notificação de bolha
    - Interação de notificação
    - Luz de notificação de borda
    - Mensagem de pop-up
    - Remover notificações
    - Responder notificação
    - Restaurar notificações ocultas
    - Sobreposição de animação
  - Registros
    - Abrir os registros do MacroDroid
    - Calendário - Adicionar evento
    - Exportar registro
    - Limpar registros
    - Registrar evento
  - Tela
    - Bloquear Toques na Tela
    - Brilho
    - Definir o tempo limite da tela
    - Escurecer a tela
    - Forçar rotação da tela
    - Ler conteúdo da tela
    - Ler o conteúdo da captura de ecrã
    - Ligar/Desligar tela
    - Manter o aparelho ativo
    - Obter texto do ID da vista
    - Texto da imagem (OCR)
    - Verificar a cor dos píxeis
    - Verificar texto na captura de ecrã
    - Verificar texto na tela
  - Telefone
    - Abrir registro de chamadas
    - Atender chamada automaticamente
    - Contato via aplicativo
    - Definir toque
    - Efetuar chamada
    - Limpar o registro de chamadas
    - Obter contactos
    - Rejeitar chamada
  - Variáveis
    - Definir variável
      - Tela: Tela 1  Selecione a variável  [ ] Nova Variável [... Lista com variáveis já criadas se houver]  CANCELAR | OK
      - Tela: Tela 2: [ X ] Nova Variável  * Criar nova variável  [ ] Local  [ ] Global  [... Digite o nome da variável] | botão: [...] (Lista de palavras mágicas, as palavras mágicas não são por "[ ]", são por "{ }")  * Tipo de variável:  Lista: Booleano, inteiro, string, decimal, dicionário e lista  [ ] Criar variável agora [ ] Tornar a variável segura
      - Tela: Tela 3: [ X ] Local, Booleano, [ X ] Criar variável agora  * Ajustes [Nome da variável]  Lista: [ ] falso, [ ] verdadeiro, [ ] inverter, [ ] \`[Prompt de usuário]\`, [ ] Variável (mostra lista de variáveis criadas)  CANCELAR | OK
    - Eliminar variável
    - Limpar entrada de Dicionário/Lista
    - Limpar variáveis
    - Manipulação de matrizes
  - Volume
    - Ajustar volume
      - Tela: Tela 1:   Ajustar volume:  [ ] Definir volume em primeiro plano  ---  [ ] Alarme  Valor do cursor | \/ (Botão de seta pra baixo, lá tem a lista com as variáveis, caso alguma tenha sido criada, e que seja necessário usá-la)  0% — — — 100%  ---  [ ] Mídia / Música  Valor do cursor | \/  0% — — — 100%  ---  [ ] Notificação  Valor do cursor | \/  0% — — — 100%  ---  [ ] Chamada  Valor do cursor | \/  0% — — — 100%  ---  [ ] Sons do Sistema  Valor do cursor | \/  0% — — — 100%  ---  [ ] Chamada de voz  Valor do cursor | \/  0% — — — 100%  ---  [ ] Bluetooth  Valor do cursor | \/  0% — — — 100%  ---  [ ] Acessibilidade  Valor do cursor | \/  0% — — — 100%  CANCELAR | OK
    - Alto-falante ligado/desligado
    - Aumentar/diminuir volume
    - Modo Prioritário / Não Perturbe
      - Tela: Tela 1:  Selecione uma opção:  ( ) Permitir tudo ( ) Somente prioridade ( ) Silêncio total  ( ) Somente alarmes  CANCELAR | OK
    - Mostrar pop-up de volume
    - Silencioso (sem vibração)
    - Vibração ativada/desativada

## RESTRIÇÕES
  - Bateria/Potência
    - Alimentação externa
    - Estado de Economia de Bateria
    - Nível da bateria
    - Temperatura da bateria
  - Conectividade
    - Dados móveis ligados/desligados
    - Endereço IP
    - Estado do Bluetooth
    - Estado do GPS
    - Estado do Wi-Fi
    - Estado do ponto de acesso Wi-Fi
    - Modo da localização
    - Roaming
    - Status do sinal de celular
  - Data/Hora
    - Cronômetro
    - Dia da semana
    - Dia do mês
    - Entrada de calendário
    - Hora do dia
    - Mês do ano
    - Nascer/Pôr do sol
  - Específico do MacroDroid
    - Botão flutuante
    - Categoria ativada/desativada
    - Comparar valores
    - E / OU / OU... OU / NÃO
    - Estado da gaveta do MacroDroid
    - Estado rápido do bloco
    - Gatilho disparado
    - Macro em execução
    - Macro habilitada/desabilitada
    - Macro(s) invocada(s) ou não recentemente
    - Modo do MacroDroid
    - Método de invocação da macro
    - Texto Flutuante
    - Variável do MacroDroid
  - Estado do Dispositivo
    - Aplicativo instalado
    - Aplicativo rodando
    - Configuração de sistema
    - Conteúdos da área de transferência
    - Dispositivo bloqueado/desbloqueado
    - Dispositivo com acesso root
    - Estado do NFC
    - Estado do VPN
    - Hack ADB aplicado
    - Lanterna Ligada/Desligada
    - Modo avião
    - Roaming ativado
    - Rotação automática
    - Sincronização automática
    - Tempo desde a inicialização
    - Texto de apresentação
  - Localização
    - Perímetro (localização)
    - Torres de celular
  - Mídia
    - Conexão do fone de ouvido
    - Música ativa
  - Notificação
    - Modo Prioritário / Não Perturbe
    - Notificação presente
    - Volume das notificações
  - Sensores
    - Dispositivo voltado para cima/baixo
    - Orientação do dispositivo
    - Sensor de luz
    - Sensor de proximidade
  - Tela e alto-falante
    - Alto-falante ligado/desligado
    - Brilho
    - Estado do ecrã ambiente
    - Nível do volume
    - Tela ligada/desligada
    - Tema escuro
    - Volume da campainha
  - Telefone
    - Estado de chamada
    - Telefone tocando

## VARIÁVEIS
  (Nenhuma variável definida)
`;
