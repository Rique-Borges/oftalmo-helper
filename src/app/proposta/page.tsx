'use client';

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Database,
  FileCheck2,
  Laptop2,
  Menu,
  MessageCircle,
  Minus,
  MousePointerClick,
  PhoneCall,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    id: "operacional",
    name: "Operacional",
    description:
      "Para manter o atendimento ágil e automatizar a rotina diária do ponto.",
    price: "300",
    highlight: false,
    features: [
      "Colinha dinâmica Médico × Exame × Preparo",
      "Scripts de atendimento com cópia em 1 clique",
      "Busca rápida integrada",
      "Processamento de arquivos AFD",
      "Relatório de horas em CSV/Excel",
      "Suporte em horário comercial",
    ],
  },
  {
    id: "gestao",
    name: "Gestão Integrada",
    description:
      "Controle gerencial, pré-folha e uma operação de RH muito mais organizada.",
    price: "700",
    highlight: true,
    features: [
      "Tudo do plano Operacional",
      "Espelho de ponto individual em PDF",
      "Cálculo de horas extras",
      "Cálculo de remuneração por funcionário",
      "Dossiê completo do colaborador",
      "Controle de banco de horas",
      "Suporte prioritário com SLA de até 4h úteis",
    ],
  },
  {
    id: "avancado",
    name: "Operação Avançada",
    description:
      "Integrações, autosserviço e automações para uma operação mais conectada.",
    price: "1.250",
    highlight: false,
    features: [
      "Tudo do plano Gestão Integrada",
      "Integração com dados do sistema de agendamento",
      "Portal mobile do colaborador",
      "2h/mês de desenvolvimento",
      "Suporte prioritário via WhatsApp",
    ],
  },
];

const modules = [
  {
    icon: PhoneCall,
    title: "Call Center inteligente",
    description:
      "Informações críticas de médicos, exames, convênios e preparos organizadas em um único fluxo.",
  },
  {
    icon: Clock3,
    title: "Motor de Ponto AFD",
    description:
      "Transforme arquivos brutos de ponto em informações prontas para análise e fechamento.",
  },
  {
    icon: Receipt,
    title: "Prévia de Folha",
    description:
      "Antecipe o custo de pessoal com cálculos de horas extras, atrasos e faltas.",
  },
  {
    icon: Users,
    title: "Gestão do Colaborador",
    description:
      "Centralize jornada, salário, cargo, atestados, banco de horas e histórico.",
  },
  {
    icon: Database,
    title: "Integração com Moderna",
    description:
      "Cruze informações da agenda médica com procedimentos e regras de atendimento.",
  },
  {
    icon: Laptop2,
    title: "Portal do Colaborador",
    description:
      "Permita que sua equipe consulte o ponto e envie documentos diretamente pelo celular.",
  },
];

const comparison = [
  ["Colinha dinâmica Médico × Exame × Preparo", true, true, true],
  ["Scripts de atendimento com cópia rápida", true, true, true],
  ["Busca rápida integrada", true, true, true],
  ["Processamento de AFD", true, true, true],
  ["Relatórios CSV/Excel", true, true, true],
  ["Espelho de ponto em PDF", false, true, true],
  ["Cálculo de remuneração", false, true, true],
  ["Dossiê do colaborador", false, true, true],
  ["Banco de horas", false, true, true],
  ["Integração com Moderna", false, false, true],
  ["Portal do colaborador", false, false, true],
  ["Horas de desenvolvimento", false, false, "2h/mês"],
];

const addons = [
  ["Cálculo de Remuneração", "Hora extra, Descanso Semanal Remunerado e descontos", "250"],
  ["Espelho de Ponto PDF", "Geração de espelhos individuais", "180"],
  ["Ponte de Dados Moderna", "Importação e cruzamento de agenda", "350"],
  ["Dossiê do Colaborador", "Geração de dossiês individuais", "200"],
];

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CheckItem({
  children,
  included = true,
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {included ? (
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-3.5" />
        </div>
      ) : (
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground/30">
          <Minus className="size-4" />
        </div>
      )}

      <span className="text-sm leading-6 text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

export default function ComercialPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span>Vista Clara<span className="text-primary"> Helper</span></span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#solucao" className="transition-colors hover:text-foreground">
              Solução
            </a>
            <a href="#modulos" className="transition-colors hover:text-foreground">
              Módulos
            </a>
            <a href="#planos" className="transition-colors hover:text-foreground">
              Planos
            </a>
            <a href="#comparativo" className="transition-colors hover:text-foreground">
              Comparativo
            </a>
          </nav>

          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[760px] items-center overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 size-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 size-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-16 px-5 py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Plataforma em evolução
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Menos operação manual.
              <br />
              <span className="text-primary">Mais controle.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Uma plataforma criada para centralizar atendimento, ponto,
              pré-folha e gestão de colaboradores em uma única operação.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#planos" className={buttonVariants({ size: "lg", className: "h-12 px-6" })}>
                Conhecer os planos
                <ArrowRight className="ml-2 size-4" />
              </a>

              <a href="#solucao" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-6" })}>
                Ver como funciona
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Dados centralizados
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                Fluxos mais rápidos
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Mais previsibilidade
              </div>
            </div>
          </FadeIn>

          {/* MOCKUP */}
          <FadeIn delay={0.15}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                <div className="flex h-12 items-center gap-2 border-b px-4">
                  <div className="size-2.5 rounded-full bg-red-400/70" />
                  <div className="size-2.5 rounded-full bg-yellow-400/70" />
                  <div className="size-2.5 rounded-full bg-green-400/70" />
                  <div className="ml-4 h-6 flex-1 rounded-md bg-muted" />
                </div>

                <div className="grid grid-cols-[170px_1fr]">
                  <aside className="hidden border-r bg-muted/30 p-4 sm:block">
                    <div className="mb-7 text-xs font-semibold text-muted-foreground">
                      OPERAÇÃO
                    </div>

                    <div className="space-y-2">
                      {["Dashboard", "Atendimento", "Ponto", "Colaboradores", "Relatórios"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`rounded-lg px-3 py-2 text-xs ${
                              index === 0
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </aside>

                  <div className="p-5 sm:p-7">
                    <div className="mb-6">
                      <div className="text-xs text-muted-foreground">
                        Visão geral
                      </div>
                      <div className="mt-1 text-xl font-semibold">
                        Operação da clínica
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Atendimentos", "1.284"],
                        ["Colaboradores", "48"],
                        ["Horas processadas", "8.492h"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border bg-background p-4"
                        >
                          <div className="text-[11px] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 text-lg font-semibold">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium">
                            Processamento do ponto
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            Fechamento mensal
                          </div>
                        </div>

                        <Badge variant="secondary">Concluído</Badge>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          transition={{ duration: 1.3, delay: 0.3 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>

                      <div className="mt-2 text-right text-[11px] text-muted-foreground">
                        92% processado
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* CONTEXTO */}
      <section id="solucao" className="border-y bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-5">
              O problema
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              A operação não deveria depender de processos manuais.
            </h2>

            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              A plataforma transforma tarefas fragmentadas em fluxos
              estruturados, reduzindo retrabalho e aumentando a previsibilidade
              da operação.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <FadeIn>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <PhoneCall className="size-5" />
                  </div>
                  <CardTitle>Atendimento & Call Center</CardTitle>
                  <CardDescription>
                    Informações espalhadas geram dúvidas, retrabalho e risco de
                    erros durante o atendimento.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <CheckItem>
                      Médicos, exames e convênios organizados
                    </CheckItem>
                    <CheckItem>
                      Preparos e restrições acessíveis rapidamente
                    </CheckItem>
                    <CheckItem>
                      Scripts e orientações com cópia instantânea
                    </CheckItem>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <BriefcaseBusiness className="size-5" />
                  </div>
                  <CardTitle>Departamento Pessoal</CardTitle>
                  <CardDescription>
                    O fechamento manual consome tempo e aumenta a possibilidade
                    de inconsistências.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <CheckItem>Processamento automático do AFD</CheckItem>
                    <CheckItem>Atestados e ausências centralizados</CheckItem>
                    <CheckItem>Prévia financeira da folha</CheckItem>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-5">
                Plataforma
              </Badge>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Tudo conectado em uma única operação.
              </h2>

              <p className="mt-5 text-lg text-muted-foreground">
                Cada módulo foi pensado para resolver uma etapa específica da
                rotina, sem criar mais complexidade.
              </p>
            </div>
          </FadeIn>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <FadeIn key={module.title} delay={index * 0.05}>
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-lg">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="leading-6">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* SETUP */}
      <section className="border-y bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <FadeIn>
              <Badge variant="outline" className="mb-5">
                Implantação
              </Badge>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Da plataforma atual para uma operação pronta para produção.
              </h2>

              <p className="mt-5 leading-7 text-muted-foreground">
                A implantação contempla o revamp visual, otimização de
                performance, parametrização das regras de negócio e treinamento
                das equipes.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock3 className="size-5" />
                </div>
                <div>
                  <div className="font-medium">10 a 15 dias úteis</div>
                  <div className="text-sm text-muted-foreground">
                    Prazo estimado de implantação
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="overflow-hidden shadow-xl">
                <CardHeader className="border-b bg-background">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Setup, Revamp & Parametrização</CardTitle>
                      <CardDescription className="mt-1">
                        Investimento único
                      </CardDescription>
                    </div>

                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="size-5" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["Redesign UI/UX", "Interface moderna e adaptada"],
                      ["Performance", "Componentes otimizados"],
                      ["Regras de negócio", "Jornadas, tolerâncias e feriados"],
                      ["Treinamento", "Capacitação das equipes"],
                    ].map(([title, description]) => (
                      <div
                        key={title}
                        className="rounded-xl border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Check className="size-4 text-primary" />
                          {title}
                        </div>
                        <div className="mt-1 pl-6 text-sm text-muted-foreground">
                          {description}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Investimento
                      </div>
                      <div className="mt-1 text-3xl font-semibold">
                        R$ 1.350
                      </div>
                    </div>

                    <Badge>2× R$ 675</Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-5">
              Assinatura SaaS
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Escolha o nível de operação da sua clínica.
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Comece com o essencial e evolua conforme a operação cresce.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 pt-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <FadeIn key={plan.id} delay={index * 0.08} className="h-full">
                <Card
                  className={`relative flex h-full flex-col overflow-visible ${
                    plan.highlight
                      ? "border-2 border-primary shadow-2xl shadow-primary/10 lg:-translate-y-2"
                      : ""
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="px-3.5 py-1 text-xs font-semibold shadow-md whitespace-nowrap bg-primary text-primary-foreground">
                        Recomendado
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-5">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="min-h-[48px] leading-6">
                      {plan.description}
                    </CardDescription>

                    <div className="pt-4">
                      <span className="text-sm text-muted-foreground">
                        R$
                      </span>
                      <span className="ml-1 text-5xl font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        /mês
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <Separator className="mb-6" />

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <CheckItem key={feature}>{feature}</CheckItem>
                      ))}
                    </div>

                    <a
                      href="#contato"
                      className={buttonVariants({
                        variant: plan.highlight ? "default" : "outline",
                        className: "mt-8 w-full",
                      })}
                    >
                      Quero este plano
                      <ArrowRight className="ml-2 size-4" />
                    </a>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* DESTAQUE PLANO 2 */}
      <section className="px-5 pb-24 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border bg-foreground text-background">
            <div className="grid lg:grid-cols-[1fr_.8fr]">
              <div className="p-8 sm:p-12 lg:p-16">
                <Badge
                  variant="secondary"
                  className="mb-6 bg-background/10 text-background"
                >
                  Gestão Integrada
                </Badge>

                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                  Transforme o fechamento do ponto em uma operação previsível.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-background/65">
                  O plano combina controle de ponto, prévia de remuneração,
                  gestão documental e informações centralizadas do colaborador.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    "Espelho de ponto em PDF",
                    "Cálculo de remuneração por funcionário",
                    "Dossiê do colaborador",
                    "Banco de horas",
                    "SLA de até 4h úteis",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-background/80"
                    >
                      <BadgeCheck className="size-4 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD DE PRÉVIA DE FECHAMENTO */}
              <div className="relative hidden items-center justify-center border-l border-background/10 p-8 lg:flex lg:p-12">
                <div className="absolute inset-0 bg-primary/10" />

                <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/45">Prévia do fechamento</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        Fechamento do ponto
                      </p>
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Em dia
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/55">Colaboradores processados</span>
                      <span className="font-medium text-white">42 / 48</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[87%] rounded-full bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Horas extras</p>
                        <p className="mt-1 text-lg font-semibold text-white">86h 20min</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Banco de horas</p>
                        <p className="mt-1 text-lg font-semibold text-white">32h 10min</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Atrasos</p>
                        <p className="mt-1 text-lg font-semibold text-white">12h 45min</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Pendências</p>
                        <p className="mt-1 text-lg font-semibold text-white">2 ajustes</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-xs text-white/40">Status do fechamento</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          6 colaboradores aguardando revisão
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* COMPARATIVO */}
      <section id="comparativo" className="border-y bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-5">
                Comparativo
              </Badge>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Compare os recursos de cada plano.
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border bg-background shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-6 py-5 text-left font-medium">
                        Funcionalidade
                      </th>
                      <th className="px-4 py-5 text-center font-medium">
                        Operacional
                      </th>
                      <th className="px-4 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">
                            Gestão
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            Recomendado
                          </Badge>
                        </div>
                      </th>
                      <th className="px-4 py-5 text-center font-medium">
                        Avançado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {comparison.map(([feature, one, two, three]) => (
                      <tr key={String(feature)} className="border-b last:border-0">
                        <td className="px-6 py-4 font-medium">
                          {feature}
                        </td>

                        {[one, two, three].map((value, index) => (
                          <td
                            key={index}
                            className="px-4 py-4 text-center"
                          >
                            {value === true ? (
                              <Check className="mx-auto size-4 text-primary" />
                            ) : value === false ? (
                              <Minus className="mx-auto size-4 text-muted-foreground/30" />
                            ) : (
                              <span className="text-xs font-medium">
                                {value}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ADDONS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-5">
                Flexibilidade
              </Badge>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Adicione somente o que sua operação precisa.
              </h2>

              <p className="mt-5 text-lg text-muted-foreground">
                Funcionalidades específicas também podem ser contratadas
                separadamente.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {addons.map(([title, description, price], index) => (
              <FadeIn key={title} delay={index * 0.05}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-2xl font-semibold">
                      + R$ {price}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /mês
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONDIÇÕES */}
      <section className="border-y bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-5">
              Condições comerciais
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Uma implantação clara, com evolução contínua.
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: MousePointerClick,
                title: "Pagamento",
                text: "Mensalidade via Pix ou boleto, com vencimento no dia acordado.",
              },
              {
                icon: FileCheck2,
                title: "Contrato semestral",
                text: "Condições padrão da proposta durante o ciclo contratado.",
              },
              {
                icon: Sparkles,
                title: "Contrato anual",
                text: "30% de desconto no setup ou 1 mensalidade gratuita.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <FadeIn key={title} delay={index * 0.07}>
                <Card>
                  <CardHeader>
                    <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="leading-6">
                      {text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 -z-10 bg-primary/5" />

        <div className="absolute left-1/2 top-1/2 -z-10 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <FadeIn className="mx-auto max-w-3xl px-5 text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <MessageCircle className="size-6" />
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Pronto para levar a operação para o próximo nível?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Vamos alinhar o plano ideal, validar o escopo e iniciar a
            implantação da plataforma.
          </p>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="font-medium text-foreground">
              Vista Clara<span className="text-primary"> Helper</span>
            </span>
          </div>

          <span>
            Plataforma Web de Otimização Operacional
          </span>
        </div>
      </footer>
    </main>
  );
}