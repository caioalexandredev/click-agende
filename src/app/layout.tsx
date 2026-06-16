import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ClickAgende",
  title: {
    default: "ClickAgende | Agendamento inteligente para empresas e clientes",
    template: "%s | ClickAgende",
  },
  description:
    "Plataforma para encontrar empresas, agendar serviços, gerenciar profissionais, acompanhar atendimentos e enviar notificações por email e WhatsApp.",
  keywords: [
    "agendamento online",
    "gestão de agendamentos",
    "agenda para empresas",
    "serviços com hora marcada",
    "ClickAgende",
    "notificações de agendamento",
  ],
  authors: [{ name: "ClickAgende" }],
  creator: "ClickAgende",
  publisher: "ClickAgende",
  category: "Agendamentos",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "ClickAgende | Agendamento inteligente",
    description:
      "Agende serviços com empresas em poucos cliques e gerencie sua operação com profissionais, serviços, histórico e notificações.",
    url: "/",
    siteName: "ClickAgende",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickAgende | Agendamento inteligente",
    description:
      "Agendamento online para clientes e gestão completa de atendimentos para empresas.",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <div className="flex-1">{children}</div>
          <AppFooter />
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
