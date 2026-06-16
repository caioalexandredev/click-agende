import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | ClickAgende",
  description:
    "Política de Privacidade do ClickAgende, com informações sobre tratamento de dados pessoais, direitos dos titulares e uso da plataforma.",
};

const sections = [
  {
    title: "1. Sobre esta política",
    content: [
      "Esta Política de Privacidade explica como o ClickAgende trata dados pessoais de clientes, empresas, profissionais e demais usuários que utilizam a plataforma para cadastro, gestão e agendamento de serviços.",
      "O documento foi preparado como base operacional para a plataforma, mas deve ser revisado e ajustado por profissional jurídico antes do uso em produção, especialmente com os dados reais do controlador, canais de atendimento e fornecedores contratados.",
    ],
  },
  {
    title: "2. Quem é responsável pelos dados",
    content: [
      "Para dados relacionados à conta, autenticação, segurança, funcionamento da plataforma e relacionamento direto com o usuário, o ClickAgende pode atuar como controlador, decidindo as finalidades e meios essenciais do tratamento.",
      "Quando uma empresa usa o painel para cadastrar seus serviços, profissionais, clientes e agendamentos, essa empresa pode atuar como controladora dos dados que insere e administra. Nesses casos, o ClickAgende pode atuar como operador, realizando o tratamento conforme as instruções da empresa e conforme necessário para manter a plataforma funcionando.",
    ],
  },
  {
    title: "3. Dados que podemos tratar",
    content: [
      "Podemos tratar dados de identificação e contato, como nome, CPF ou CNPJ quando aplicável, telefone, e-mail, endereço, cidade, estado, credenciais de acesso e informações necessárias para autenticação.",
      "Também podemos tratar dados de uso da plataforma, como tipo de perfil, empresa vinculada, serviços cadastrados, profissionais, horários, status de agendamentos, histórico de ações, preferências de interface e registros técnicos de segurança.",
      "Dados sensíveis somente devem ser inseridos quando forem realmente necessários para a prestação do serviço contratado e quando houver base legal adequada. A plataforma não deve ser usada para armazenar informações sensíveis sem necessidade, como dados de saúde detalhados, origem racial, convicção religiosa ou biometria.",
    ],
  },
  {
    title: "4. Finalidades do tratamento",
    content: [
      "Usamos dados pessoais para criar e manter contas, autenticar usuários, exibir informações de empresas, serviços e profissionais, registrar solicitações de agendamento, permitir a gestão da agenda e comunicar eventos relevantes da plataforma.",
      "Também podemos usar dados para prevenir fraudes, proteger a segurança dos usuários, cumprir obrigações legais ou regulatórias, responder solicitações de titulares, melhorar a experiência de uso e manter registros necessários para exercício regular de direitos.",
    ],
  },
  {
    title: "5. Bases legais",
    content: [
      "O tratamento de dados pessoais pode se apoiar, conforme o caso, na execução de contrato ou de procedimentos preliminares, no cumprimento de obrigação legal ou regulatória, no legítimo interesse, no exercício regular de direitos e no consentimento quando ele for necessário.",
      "Quando o tratamento depender de consentimento, o usuário poderá revogá-lo pelos canais indicados nesta política, observados os tratamentos que possam continuar por outra base legal permitida pela legislação.",
    ],
  },
  {
    title: "6. Compartilhamento de dados",
    content: [
      "Dados podem ser compartilhados entre clientes, empresas e profissionais na medida necessária para solicitar, confirmar, executar, cancelar ou acompanhar agendamentos.",
      "Também podemos compartilhar dados com fornecedores essenciais para hospedagem, infraestrutura, autenticação, envio de comunicações, suporte técnico, auditoria, segurança e cumprimento de obrigações legais. Esses terceiros devem tratar os dados conforme contratos, instruções e medidas compatíveis com a legislação aplicável.",
      "Podemos compartilhar informações com autoridades públicas, órgãos reguladores ou terceiros quando houver obrigação legal, ordem válida, necessidade de defesa de direitos ou prevenção de ilícitos.",
    ],
  },
  {
    title: "7. Cookies, sessão e armazenamento local",
    content: [
      "A plataforma pode usar cookies, tokens de sessão e armazenamento local para manter o usuário autenticado, aplicar preferências de interface, proteger a conta e melhorar o funcionamento do serviço.",
      "O usuário pode configurar o navegador para bloquear ou apagar cookies, mas algumas funções da plataforma podem deixar de funcionar corretamente.",
    ],
  },
  {
    title: "8. Retenção e exclusão",
    content: [
      "Manteremos dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, executar contratos, atender obrigações legais ou regulatórias, preservar registros de segurança e exercer direitos em processos administrativos, judiciais ou arbitrais.",
      "Quando os dados não forem mais necessários, poderemos eliminá-los, anonimizá-los ou mantê-los bloqueados pelo prazo legal aplicável.",
    ],
  },
  {
    title: "9. Segurança da informação",
    content: [
      "Adotamos medidas técnicas e administrativas razoáveis para proteger dados pessoais contra acessos não autorizados, perda, alteração, divulgação indevida e outras formas de tratamento inadequado.",
      "Nenhuma plataforma é totalmente imune a incidentes. Em caso de incidente de segurança que possa gerar risco ou dano relevante aos titulares, serão adotadas as providências cabíveis conforme a legislação aplicável.",
    ],
  },
  {
    title: "10. Direitos dos titulares",
    content: [
      "Nos termos da LGPD, o titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade, portabilidade quando regulamentada, informações sobre compartilhamento, revisão de decisões automatizadas quando existirem, revogação de consentimento e oposição a tratamentos irregulares.",
      "As solicitações serão avaliadas conforme a identidade do solicitante, a relação com a plataforma, os dados envolvidos e as obrigações legais aplicáveis.",
    ],
  },
  {
    title: "11. Transferências internacionais",
    content: [
      "Alguns fornecedores de infraestrutura, hospedagem, comunicação ou segurança podem estar localizados fora do Brasil ou utilizar servidores em outros países. Nesses casos, serão adotadas medidas compatíveis com a LGPD para proteger os dados pessoais transferidos.",
    ],
  },
  {
    title: "12. Crianças e adolescentes",
    content: [
      "A plataforma não é direcionada a crianças. O uso por adolescentes deve ocorrer com autorização e supervisão de responsável legal quando exigido pela legislação ou pela natureza do serviço agendado.",
    ],
  },
  {
    title: "13. Alterações desta política",
    content: [
      "Esta política pode ser atualizada para refletir mudanças na plataforma, nos tratamentos realizados, em fornecedores, requisitos legais ou práticas de segurança. A versão vigente será publicada nesta página com a data de atualização.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">ClickAgende</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <section className="pt-8">
          <div className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Última atualização: 15 de junho de 2026
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Política de Privacidade
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Transparência sobre como dados pessoais são coletados, usados, armazenados,
            compartilhados e protegidos no ClickAgende.
          </p>
        </section>

        <article className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-border/70 pb-7 last:border-b-0">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.content.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-muted-foreground sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-12 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <Link href="/termos-de-uso" className="font-medium text-foreground hover:text-primary">
            Termos de Uso
          </Link>
          <span aria-hidden="true">•</span>
          <Link href="/" className="font-medium text-foreground hover:text-primary">
            Página inicial
          </Link>
        </footer>
      </main>
    </div>
  );
}
