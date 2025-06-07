// src/app/page.tsx
import { ToolColumn } from "@/components/ToolColumn";
import { ToolCard } from "@/components/ToolCard";
import { Zap, Target, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-background p-4 lg:p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            <span className="bg-gradient-to-r from-accent-start to-accent-end bg-clip-text text-transparent">
              NexusFlow
            </span>
          </h1>
          <p className="text-muted-foreground">Seu planejador de automação para MacroDroid</p>
        </div>
      </header>
      
      {/* Área de Definição de Ferramentas */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        <ToolColumn title="Gatilhos" icon={Zap}>
          {/* Exemplos de cards. Serão dinâmicos no futuro. */}
          <ToolCard name="Chamada Recebida" />
          <ToolCard name="Nível da Bateria" />
          <ToolCard name="Conexão Wi-Fi" />
        </ToolColumn>

        <ToolColumn title="Ações" icon={Target}>
          <ToolCard name="Enviar Notificação" />
          <ToolCard name="Abrir Aplicativo" />
          <ToolCard name="Definir Volume" />
        </ToolColumn>

        <ToolColumn title="Restrições" icon={ShieldCheck}>
          <ToolCard name="Dia da Semana" />
          <ToolCard name="Horário do Dia" />
        </ToolColumn>
      </div>

      {/* Área de IA (placeholder por enquanto) */}
      <footer className="mt-6">
        <div className="bg-card rounded-lg p-4">
          <p className="text-center text-muted-foreground">A área de interação com a IA virá aqui.</p>
        </div>
      </footer>
    </main>
  );
}
