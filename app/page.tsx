'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  Download,
  DollarSign,
  Lock,
  LogOut,
  Mail,
  PieChart,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

type CardItem = {
  title: string;
  value: number;
  change: string;
  positive: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

type TransactionItem = {
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'entrada' | 'saida';
  status: 'Pago' | 'Pendente' | 'Processando';
};

const cards: CardItem[] = [
  {
    title: 'Saldo disponível',
    value: 24890.42,
    change: '+8,2% no mês',
    positive: true,
    icon: Wallet,
  },
  {
    title: 'Receitas',
    value: 18450.0,
    change: '+12,4% vs. mês anterior',
    positive: true,
    icon: TrendingUp,
  },
  {
    title: 'Despesas',
    value: 6398.33,
    change: '-3,8% vs. mês anterior',
    positive: true,
    icon: TrendingDown,
  },
  {
    title: 'Cartões e cobranças',
    value: 2189.9,
    change: '4 itens em aberto',
    positive: false,
    icon: CreditCard,
  },
];

const chartData = [
  { label: 'Jan', income: 58, expense: 34 },
  { label: 'Fev', income: 64, expense: 30 },
  { label: 'Mar', income: 72, expense: 41 },
  { label: 'Abr', income: 69, expense: 38 },
  { label: 'Mai', income: 80, expense: 44 },
  { label: 'Jun', income: 76, expense: 36 },
];

const transactions: TransactionItem[] = [
  {
    title: 'Assinatura SaaS',
    category: 'Software',
    date: '12/03/2026',
    amount: 289.9,
    type: 'saida',
    status: 'Pago',
  },
  {
    title: 'Recebimento cliente Alpha',
    category: 'Receita',
    date: '11/03/2026',
    amount: 3250.0,
    type: 'entrada',
    status: 'Pago',
  },
  {
    title: 'Internet empresarial',
    category: 'Infraestrutura',
    date: '10/03/2026',
    amount: 189.9,
    type: 'saida',
    status: 'Pago',
  },
  {
    title: 'Projeto Landing Page',
    category: 'Serviços',
    date: '09/03/2026',
    amount: 1450.0,
    type: 'entrada',
    status: 'Processando',
  },
  {
    title: 'Licença operacional',
    category: 'Administrativo',
    date: '07/03/2026',
    amount: 420.0,
    type: 'saida',
    status: 'Pendente',
  },
];

function formatBRL(value: number) {
  const fixed = value.toFixed(2);
  const [intPart, decimalPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formattedInt},${decimalPart}`;
}

function statusClass(status: TransactionItem['status']) {
  if (status === 'Pago') {
    return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20';
  }
  if (status === 'Processando') {
    return 'bg-blue-500/15 text-blue-300 border border-blue-400/20';
  }
  return 'bg-amber-500/15 text-amber-300 border border-amber-400/20';
}

export default function OpervioFinanceLiteApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [search, setSearch] = useState('');
  const [loginInput, setLoginInput] = useState({
    email: '',
    password: '',
  });

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transactions;

    return transactions.filter((item) => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [search]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingLogin(true);

    try {
      // Se você já tem autenticação real (ex.: Supabase),
      // substitua apenas este trecho pela sua lógica atual.
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!loginInput.email || !loginInput.password) {
        alert('Preencha e-mail e senha.');
        return;
      }

      setAuthenticated(true);
    } finally {
      setLoadingLogin(false);
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    setLoginInput({ email: '', password: '' });
  }

  if (!authenticated) {
    return (
      <>
        <main className="relative min-h-screen overflow-hidden bg-[#07111F] text-slate-50">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.20),transparent_30%),linear-gradient(180deg,#07111F_0%,#081426_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-30" />
          <div className="absolute left-[-120px] top-[-60px] h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-[-80px] right-[-90px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                OPERVIO FINANCE LITE
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
                Controle financeiro com visual premium e operação real.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
                Centralize indicadores, lançamentos, cobranças e relatórios em uma
                interface refinada, confiável e pronta para apresentação comercial.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm text-slate-400">Dashboard elegante</p>
                  <p className="mt-2 text-xl font-semibold text-white">KPIs + visão rápida</p>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm text-slate-400">Fluxo financeiro</p>
                  <p className="mt-2 text-xl font-semibold text-white">Receitas e despesas</p>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm text-slate-400">Exportação</p>
                  <p className="mt-2 text-xl font-semibold text-white">Relatórios e PDF</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Login premium
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Interface SaaS
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Pronto para demo
                </span>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 mx-auto h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="glass-card premium-glow relative mx-auto w-full max-w-md rounded-[28px] p-6 md:p-8">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    Área segura
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Entrar no sistema
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Acesse o painel financeiro com um layout mais sofisticado, moderno e
                    pronto para impressionar.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">E-mail</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={loginInput.email}
                        onChange={(e) =>
                          setLoginInput((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="admin@opervio.com"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Senha</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        value={loginInput.password}
                        onChange={(e) =>
                          setLoginInput((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingLogin}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingLogin ? 'Entrando...' : 'Acessar dashboard'}
                  </button>
                </form>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-slate-400">
                  Demo visual premium. Para manter sua autenticação real, troque apenas a
                  função <span className="text-slate-200">handleLogin</span>.
                </div>
              </div>
            </section>
          </div>
        </main>

        <style jsx global>{`
          html,
          body {
            background: #07111f;
          }

          .soft-grid {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 34px 34px;
            mask-image: radial-gradient(circle at center, black 35%, transparent 100%);
            -webkit-mask-image: radial-gradient(circle at center, black 35%, transparent 100%);
          }

          .glass-card {
            background: rgba(11, 23, 48, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            box-shadow:
              0 10px 30px rgba(0, 0, 0, 0.28),
              inset 0 1px 0 rgba(255, 255, 255, 0.03);
          }

          .premium-glow {
            box-shadow:
              0 0 0 1px rgba(59, 130, 246, 0.1),
              0 18px 50px rgba(37, 99, 235, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.04);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#07111F] text-slate-50">
        <div className="flex min-h-screen">
          <aside className="hidden w-[270px] border-r border-white/10 bg-[#081326]/90 px-5 py-6 backdrop-blur-xl lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs tracking-[0.25em] text-slate-400">OPERVIO</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                OpenView Finance
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Painel financeiro refinado para operação, análise e apresentação.
              </p>
            </div>

            <nav className="mt-8 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-left text-sm text-blue-200">
                <PieChart className="h-4 w-4" />
                Visão geral
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5">
                <BarChart3 className="h-4 w-4" />
                Análises
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5">
                <CreditCard className="h-4 w-4" />
                Cobranças
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5">
                <Download className="h-4 w-4" />
                Exportações
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5">
                <Settings className="h-4 w-4" />
                Configurações
              </button>
            </nav>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Resumo do período</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Receitas</span>
                  <span className="text-emerald-300">{formatBRL(18450)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Despesas</span>
                  <span className="text-rose-300">{formatBRL(6398.33)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Saldo</span>
                  <span className="text-white">{formatBRL(24890.42)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </aside>

          <section className="flex-1">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111F]/80 backdrop-blur-xl">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Dashboard premium
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Visão geral financeira
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative hidden md:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar lançamentos..."
                      className="h-11 w-[280px] rounded-2xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                    <Bell className="h-4 w-4" />
                  </button>

                  <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(37,99,235,0.3)]">
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                </div>
              </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="glass-card rounded-3xl p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-400">{item.title}</p>
                          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                            {formatBRL(item.value)}
                          </h3>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-blue-300">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div
                        className={`mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                          item.positive
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {item.positive ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {item.change}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Fluxo mensal</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                        Receitas vs. despesas
                      </h2>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                      Receita
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-rose-400" />
                      Despesa
                    </div>
                  </div>

                  <div className="mt-8 grid h-[320px] grid-cols-6 items-end gap-4">
                    {chartData.map((item) => (
                      <div key={item.label} className="flex h-full flex-col items-center justify-end gap-3">
                        <div className="flex h-full items-end gap-2">
                          <div
                            className="w-6 rounded-t-2xl bg-gradient-to-t from-blue-700 to-blue-400"
                            style={{ height: `${item.income}%` }}
                          />
                          <div
                            className="w-6 rounded-t-2xl bg-gradient-to-t from-rose-700 to-rose-400"
                            style={{ height: `${item.expense}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6">
                    <p className="text-sm text-slate-400">Saúde financeira</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Indicadores rápidos
                    </h2>

                    <div className="mt-6 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-300">Margem operacional</span>
                          <span className="text-white">78%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div className="h-2 w-[78%] rounded-full bg-blue-500" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-300">Adimplência</span>
                          <span className="text-white">92%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div className="h-2 w-[92%] rounded-full bg-emerald-500" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-300">Comprometimento</span>
                          <span className="text-white">41%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div className="h-2 w-[41%] rounded-full bg-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6">
                    <p className="text-sm text-slate-400">Resumo do sistema</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Destaques
                    </h2>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <DollarSign className="mt-0.5 h-5 w-5 text-emerald-300" />
                        <div>
                          <p className="text-sm font-medium text-white">Saldo sólido</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            Caixa positivo e crescimento saudável no período atual.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-300" />
                        <div>
                          <p className="text-sm font-medium text-white">Operação segura</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            Interface pronta para autenticação e uso em ambiente produtivo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card mt-6 rounded-3xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Últimos lançamentos</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Movimentações recentes
                    </h2>
                  </div>

                  <div className="md:hidden">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar lançamentos..."
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-white/[0.03]">
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                          <th className="px-5 py-4 font-medium">Descrição</th>
                          <th className="px-5 py-4 font-medium">Categoria</th>
                          <th className="px-5 py-4 font-medium">Data</th>
                          <th className="px-5 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 text-right font-medium">Valor</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/10 bg-transparent">
                        {filteredTransactions.map((item) => (
                          <tr key={`${item.title}-${item.date}`} className="text-sm">
                            <td className="px-5 py-4 text-slate-200">{item.title}</td>
                            <td className="px-5 py-4 text-slate-400">{item.category}</td>
                            <td className="px-5 py-4 text-slate-400">{item.date}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs ${statusClass(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td
                              className={`px-5 py-4 text-right font-medium ${
                                item.type === 'entrada' ? 'text-emerald-300' : 'text-rose-300'
                              }`}
                            >
                              {item.type === 'entrada' ? '+' : '-'} {formatBRL(item.amount)}
                            </td>
                          </tr>
                        ))}

                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                              Nenhum lançamento encontrado para a busca informada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        html,
        body {
          background: #07111f;
        }

        .glass-card {
          background: rgba(11, 23, 48, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </>
  );
}
