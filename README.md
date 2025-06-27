
# NexusFlow 🤖✨

### Seu Co-Piloto de Automação Inteligente para MacroDroid

[![Deploy no Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://nexus-flow-orrwtkrkb-sjos0s-projects.vercel.app/)

**Acesse a aplicação em produção:** **[https://nexus-flow-orrwtkrkb-sjos0s-projects.vercel.app/](https://nexus-flow-orrwtkrkb-sjos0s-projects.vercel.app/)**

---

## 🚀 O que é o NexusFlow?

NexusFlow é uma aplicação web inovadora projetada para ser o assistente definitivo de usuários do **MacroDroid**. Ele utiliza o poder da Inteligência Artificial Generativa para transformar descrições em linguagem natural em planos de automação detalhados e prontos para serem implementados.

Em vez de se perder em menus complexos, o usuário simplesmente descreve o que deseja automatizar e fornece à IA (apelidada de **Nexus**) as ferramentas que possui disponíveis. Nexus então analisa o pedido e gera um guia passo a passo, utilizando exatamente os gatilhos, ações e restrições que o usuário cadastrou.

## 🌟 Funcionalidades Principais

- **🧠 Planejamento Baseado em IA:** Descreva uma automação complexa como "Quando eu sair de casa e meu celular não estiver conectado ao WiFi, ative os dados móveis e envie uma notificação para minha esposa" e receba um plano de macro detalhado.
- **🛠️ Banco de Conhecimento Personalizável:** O poder do NexusFlow está na sua personalização. O usuário alimenta a IA com as ferramentas que possui:
  - **Gatilhos:** Eventos que iniciam a macro (Ex: Bateria Baixa, Tela Desligada).
  - **Ações:** Tarefas a serem executadas (Ex: Ligar WiFi, Enviar SMS).
  - **Restrições:** Condições que devem ser verdadeiras para a macro rodar (Ex: Dia da Semana, App em Execução).
- **📝 Contexto Profundo com "Telas":** Para sub-opções que exigem uma configuração específica, o usuário pode adicionar "Telas de Contexto", que são instruções adicionais para a IA seguir, garantindo que o plano gerado seja preciso.
- **🗃️ Gerenciamento de Variáveis:** Crie e gerencie variáveis (Booleanas, Inteiros, Strings, etc.) que a IA pode utilizar para criar lógicas mais complexas e dinâmicas em seus planos.
- **🔄 Importação e Exportação:**
  - **`.nexus`:** Um formato de arquivo customizado que permite fazer backup e restaurar todo o seu Banco de Conhecimento com um único clique. Perfeito para compartilhar sua configuração ou migrar entre dispositivos.
  - **`.txt`:** Exporte uma versão legível por humanos do seu Banco de Conhecimento para consulta rápida.
- **✨ Interface Moderna e Responsiva:** Construído com as tecnologias mais recentes para uma experiência de usuário fluida e agradável em qualquer dispositivo.

## 📖 Como Usar

1.  **Abra o Banco de Conhecimento:** Clique no botão no canto superior direito para abrir o painel lateral.
2.  **Cadastre suas Ferramentas:** Para cada categoria (Gatilhos, Ações, Restrições), adicione as ferramentas que você utiliza no MacroDroid. Seja específico com os nomes.
3.  **Adicione Sub-Opções:** Para cada ferramenta, adicione as sub-opções relevantes. Por exemplo, para a ação "Notificação", as sub-opções podem ser "Mostrar Notificação" ou "Falar Texto".
4.  **(Avançado) Forneça Contexto com "Telas":** Se uma sub-opção como "Requisição HTTP" precisa de regras específicas (ex: "Sempre usar o método POST"), adicione uma "Tela de Contexto" com essa instrução. A IA dará prioridade máxima a essa regra.
5.  **Defina suas Variáveis:** Adicione as variáveis globais que você costuma usar em suas macros.
6.  **Descreva sua Automação:** Feche o painel, volte para a tela principal e escreva no campo de texto o que você deseja criar.
7.  **Receba o Plano:** Nexus irá analisar seu pedido e o seu Banco de Conhecimento para gerar um plano de macro completo e detalhado.

## 💻 Stack de Tecnologias

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [ShadCN UI](https://ui.shadcn.com/)
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Inteligência Artificial:** [Google Gemini](https://ai.google/discover/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Notificações:** [React Hot Toast](https://react-hot-toast.com/)
- **Deploy:** [Vercel](https://vercel.com/)

---

Feito com ❤️ para a comunidade de automação.
