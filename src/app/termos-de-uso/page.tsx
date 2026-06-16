import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso | ClickAgende",
  description:
    "Termos de Uso do ClickAgende, com regras para uso da plataforma por clientes, empresas e profissionais.",
};

const sections = [
  {
    title: "1. Aceitação dos termos",
    content: [
      "Ao acessar ou usar o ClickAgende, o usuário declara que leu, compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade.",
      "Se o usuário estiver usando a plataforma em nome de uma empresa, declara ter poderes para vinculá-la a estes termos e responder pelas informações cadastradas em seu nome.",
    ],
  },
  {
    title: "2. O que é o ClickAgende",
    content: [
      "O ClickAgende é uma plataforma digital para divulgação, gestão e solicitação de agendamentos entre clientes, empresas e profissionais.",
      "A plataforma organiza informações, agenda, serviços e comunicações relacionadas ao agendamento. O ClickAgende não presta, por si, os serviços presenciais ou remotos cadastrados pelas empresas e profissionais, salvo quando houver contratação específica em sentido diverso.",
    ],
  },
  {
    title: "3. Cadastro e conta",
    content: [
      "O usuário deve fornecer informações verdadeiras, completas e atualizadas. Contas criadas com dados falsos, incompletos, de terceiros sem autorização ou usados para fins ilícitos podem ser suspensas ou encerradas.",
      "O usuário é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as ações realizadas em sua conta, devendo comunicar imediatamente qualquer suspeita de acesso indevido.",
    ],
  },
  {
    title: "4. Regras para clientes",
    content: [
      "Clientes devem solicitar agendamentos com dados corretos, comparecer no horário marcado ou cancelar com antecedência razoável conforme as regras do estabelecimento.",
      "O cliente entende que horários, preços, duração, disponibilidade, políticas de cancelamento, execução do serviço e atendimento são definidos pela empresa ou profissional responsável pelo serviço.",
    ],
  },
  {
    title: "5. Regras para empresas e profissionais",
    content: [
      "Empresas e profissionais são responsáveis por manter dados cadastrais, serviços, preços, descrições, profissionais, imagens, horários, disponibilidade e políticas comerciais corretos e atualizados.",
      "Também são responsáveis por obter autorizações necessárias, cumprir normas aplicáveis à atividade exercida, atender clientes com segurança e qualidade, respeitar direitos do consumidor e tratar dados pessoais conforme a legislação aplicável.",
      "A empresa não deve cadastrar conteúdo enganoso, discriminatório, ilegal, ofensivo, que viole direitos de terceiros ou que prometa resultados incompatíveis com a atividade ofertada.",
    ],
  },
  {
    title: "6. Agendamentos, cancelamentos e finalização",
    content: [
      "O agendamento registrado na plataforma depende da disponibilidade informada pela empresa ou profissional e das regras aplicáveis ao serviço escolhido.",
      "Cancelamentos, atrasos, remarcações, faltas, reembolsos, cobranças e tolerâncias devem seguir a política definida pelo estabelecimento, desde que compatível com a legislação brasileira e informada de maneira adequada ao cliente.",
      "A finalização de um agendamento no sistema representa apenas o registro operacional do atendimento na plataforma, não impedindo questionamentos legítimos entre cliente, empresa e profissional.",
    ],
  },
  {
    title: "7. Valores e pagamentos",
    content: [
      "Quando a plataforma exibir valores, eles serão informados pela empresa ou profissional responsável. O ClickAgende não se responsabiliza por preço incorreto informado por terceiros, sem prejuízo dos direitos do consumidor perante o responsável pela oferta.",
      "Se pagamentos online forem disponibilizados, regras adicionais poderão ser apresentadas, incluindo meios de pagamento, taxas, estornos, antifraude e prazos de repasse.",
    ],
  },
  {
    title: "8. Condutas proibidas",
    content: [
      "É proibido usar a plataforma para violar leis, fraudar cadastros, acessar contas de terceiros, coletar dados indevidamente, interferir na segurança, enviar spam, explorar falhas, praticar engenharia reversa não autorizada ou prejudicar a experiência de outros usuários.",
      "Também é proibido publicar informações falsas, conteúdo ilícito, discriminatório, ofensivo, abusivo, que infrinja propriedade intelectual ou que exponha dados pessoais de terceiros sem base legal adequada.",
    ],
  },
  {
    title: "9. Propriedade intelectual",
    content: [
      "A marca, identidade visual, interface, textos, componentes, códigos, organização e demais elementos do ClickAgende pertencem aos seus titulares e são protegidos pela legislação aplicável.",
      "O conteúdo cadastrado por empresas, profissionais e clientes permanece de responsabilidade de quem o inseriu, que declara possuir direitos ou autorização para publicá-lo na plataforma.",
    ],
  },
  {
    title: "10. Disponibilidade e mudanças",
    content: [
      "O ClickAgende buscará manter a plataforma disponível e segura, mas não garante funcionamento ininterrupto, livre de erros ou compatível com todos os dispositivos, navegadores e integrações.",
      "A plataforma pode passar por manutenção, atualização, alteração de recursos, suspensão temporária ou descontinuação de funcionalidades, sempre que necessário para evolução, segurança, conformidade legal ou operação do serviço.",
    ],
  },
  {
    title: "11. Suspensão e encerramento",
    content: [
      "Contas ou conteúdos podem ser suspensos, removidos ou encerrados quando houver violação destes termos, suspeita de fraude, risco à segurança, ordem legal, uso indevido da plataforma ou solicitação do próprio usuário, observadas as obrigações legais de retenção.",
    ],
  },
  {
    title: "12. Limitação de responsabilidade",
    content: [
      "Na máxima extensão permitida pela lei, o ClickAgende não responde pela execução material dos serviços cadastrados por empresas ou profissionais, pela veracidade de informações inseridas por terceiros, por conflitos comerciais entre usuários ou por prejuízos decorrentes de uso indevido da plataforma.",
      "Nada nestes termos limita direitos indisponíveis do consumidor ou responsabilidades que não possam ser excluídas pela legislação brasileira.",
    ],
  },
  {
    title: "13. Privacidade e proteção de dados",
    content: [
      "O tratamento de dados pessoais relacionado ao uso da plataforma é descrito na Política de Privacidade, que integra estes Termos de Uso.",
      "Empresas e profissionais que inserem dados de clientes, funcionários ou terceiros na plataforma devem garantir que possuem base legal adequada e que informaram os titulares quando necessário.",
    ],
  },
  {
    title: "14. Alterações destes termos",
    content: [
      "Estes termos podem ser atualizados para refletir mudanças na plataforma, nos modelos de contratação, em requisitos legais ou em práticas operacionais. A versão vigente será publicada nesta página com a data de atualização.",
      "O uso contínuo da plataforma após a publicação de nova versão indica concordância com os termos atualizados, quando permitido pela legislação aplicável.",
    ],
  },
  {
    title: "15. Lei aplicável e foro",
    content: [
      "Estes termos são regidos pelas leis da República Federativa do Brasil. Para questões judiciais, recomenda-se preencher o foro competente de acordo com a operação real, sem afastar direitos legais de consumidores quando aplicáveis: [foro/comarca].",
    ],
  },
];

export default function TermsOfUsePage() {
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
            <FileText className="h-3.5 w-3.5 text-primary" />
            Última atualização: 15 de junho de 2026
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Termos de Uso
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Regras de acesso e uso do ClickAgende por clientes, empresas e profissionais.
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
          <Link
            href="/politica-de-privacidade"
            className="font-medium text-foreground hover:text-primary"
          >
            Política de Privacidade
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
