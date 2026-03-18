'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  Lock,
  LogOut,
  Mail,
  PieChart as PieChartIcon,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import { AppButton, AppCard, AppInput, AppSelect } from '@/components/ui';
import { categories, chartColors } from '@/lib/constants';
import { createClient } from '@/lib/supabase-browser';
import { dateBR, money, monthLabel } from '@/lib/format';
import type { Transaction, SummaryTotals } from '@/types';

type AuthMode = 'login' | 'signup';
type TabMode = 'dashboard' | 'lancamentos' | 'relatorios';

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  type: 'entrada',
  category: 'Serviços',
  description: '',
  amount: '',
  status: 'recebido',
  client: '',
};

export default function HomePage() {
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [busyAuth, setBusyAuth] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [busyTransactions, setBusyTransactions] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');
  const [tab, setTab] = useState<TabMode>('dashboard');
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        const email = data.session?.user?.email ?? '';
        setUserEmail(email);
        setIsLogged(Boolean(data.session));
        setSessionLoaded(true);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email ?? '');
        setIsLogged(Boolean(session));
      });
      return () => listener.subscription.unsubscribe();
    } catch (_e) {
      setSupabaseReady(false);
      setSessionLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLogged || !supabaseReady) return;
    void loadTransactions();
  }, [isLogged, supabaseReady]);

  async function loadTransactions() {
    try {
      setBusyTransactions(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error(error);
    } finally {
      setBusyTransactions(false);
    }
  }

  async function handleAuthSubmit() {
    setAuthError('');
    setBusyAuth(true);
    try {
      const supabase = createClient();
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
        setAuthError('Conta criada. Se sua instância exigir confirmação por e-mail, confirme antes de entrar.');
        setAuthMode('login');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Erro ao autenticar.');
    } finally {
      setBusyAuth(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setTransactions([]);
  }

  async function handleAddTransaction() {
    if (!form.description.trim() || !form.amount) return;
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;

      const payload = {
        user_id: userId,
        date: form.date,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        status: form.status,
        client: form.client || null,
      };

      const { error } = await supabase.from('transactions').insert(payload);
      if (error) throw error;
      setForm(initialForm);
      await loadTransactions();
      setTab('lancamentos');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível adicionar o lançamento.');
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await loadTransactions();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível excluir.');
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opervio-finance-lite.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const totals = summaryTotals;
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('Opervio Finance Lite - Relatório', 14, 18);
    pdf.setFontSize(11);
    pdf.text(`Usuário: ${userEmail || '-'}`, 14, 28);
    pdf.text(`Entradas: ${money(totals.income)}`, 14, 38);
    pdf.text(`Saídas: ${money(totals.expense)}`, 14, 46);
    pdf.text(`Saldo: ${money(totals.balance)}`, 14, 54);
    pdf.text(`Pendências: ${money(totals.pending)}`, 14, 62);
    let y = 78;
    pdf.setFontSize(12);
    pdf.text('Lançamentos:', 14, y);
    y += 8;
    filteredTransactions.slice(0, 20).forEach((item) => {
      const line = `${dateBR(item.date)} | ${item.description} | ${item.client || '-'} | ${item.type} | ${money(item.amount)}`;
      pdf.setFontSize(9);
      pdf.text(line, 14, y);
      y += 7;
    });
    pdf.save('relatorio-opervio-finance-lite.pdf');
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const haystack = `${item.description} ${item.category} ${item.client || ''}`.toLowerCase();
      const textMatch = haystack.includes(search.toLowerCase());
      const typeMatch = filterType === 'todos' ? true : item.type === filterType;
      const monthMatch = monthFilter === 'todos' ? true : new Date(item.date).getMonth() + 1 === Number(monthFilter);
      return textMatch && typeMatch && monthMatch;
    });
  }, [transactions, search, filterType, monthFilter]);

  const summaryTotals: SummaryTotals = useMemo(() => {
    const income = transactions.filter((item) => item.type === 'entrada').reduce((acc, item) => acc + item.amount, 0);
    const expense = transactions.filter((item) => item.type === 'saida').reduce((acc, item) => acc + item.amount, 0);
    const pending = transactions.filter((item) => item.status === 'pendente').reduce((acc, item) => acc + item.amount, 0);
    return { income, expense, balance: income - expense, pending };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map: Record<number, { month: number; entradas: number; saidas: number; saldo: number }> = {};
    transactions.forEach((item) => {
      const month = new Date(item.date).getMonth() + 1;
      if (!map[month]) map[month] = { month, entradas: 0, saidas: 0, saldo: 0 };
      if (item.type === 'entrada') map[month].entradas += item.amount;
      if (item.type === 'saida') map[month].saidas += item.amount;
      map[month].saldo = map[month].entradas - map[month].saidas;
    });
    return Object.values(map)
      .sort((a, b) => a.month - b.month)
      .map((item) => ({ ...item, label: monthLabel(item.month) }));
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const grouped = transactions
      .filter((item) => item.type === 'saida')
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const topClients = useMemo(() => {
    const grouped = transactions
      .filter((item) => item.type === 'entrada')
      .reduce<Record<string, number>>((acc, item) => {
        const key = item.client || 'Sem cliente';
        acc[key] = (acc[key] || 0) + item.amount;
        return acc;
      }, {});
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([client, total]) => ({ client, total }));
  }, [transactions]);

  if (!sessionLoaded) {
    return <LoadingState />;
  }

  if (!supabaseReady) {
    return <MissingConfigState />;
  }

  if (!isLogged) {
    return (
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <Wallet className="h-4 w-4" /> Opervio Finance Lite
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Produto final pronto para Supabase + Vercel.</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Login real, banco de dados online, dashboard, gráficos, relatórios PDF e exportação. Faça login ou crie sua conta para começar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>Supabase Auth</Badge>
              <Badge>Postgres</Badge>
              <Badge>Dashboard</Badge>
              <Badge>PDF</Badge>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <AppCard>
              <div className="p-6">
                <div className="mb-4 flex gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${authMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${authMode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Criar conta
                  </button>
                </div>
                <div className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <Lock className="h-5 w-5 text-blue-300" />
                  {authMode === 'login' ? 'Entrar no sistema' : 'Criar nova conta'}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">E-mail</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <AppInput
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-11"
                        placeholder="voce@empresa.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Senha</label>
                    <AppInput
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  {authError && <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">{authError}</div>}
                  <AppButton disabled={busyAuth} onClick={handleAuthSubmit} className="w-full">
                    {busyAuth ? 'Processando...' : authMode === 'login' ? 'Acessar dashboard' : 'Criar conta'}
                  </AppButton>
                </div>
              </div>
            </AppCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AppCard>
          <div className="p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <Wallet className="h-4 w-4" /> Opervio Finance Lite
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Painel financeiro simples, bonito e pronto para produção.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Bem-vindo, {userEmail}. Controle lançamentos, acompanhe o caixa, gere relatórios PDF e use o produto como base comercial da Opervio.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>Supabase Auth</Badge>
              <Badge>Postgres</Badge>
              <Badge>Dashboard</Badge>
              <Badge>PDF</Badge>
              <Badge>Vercel Ready</Badge>
            </div>
          </div>
        </AppCard>

        <AppCard className="bg-gradient-to-br from-emerald-500/10 to-slate-900">
          <div className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-3 inline-flex rounded-xl bg-emerald-500/15 p-3 text-emerald-300"><BarChart3 className="h-5 w-5" /></div>
              <h2 className="text-xl font-semibold">Visão geral</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Versão final base para evoluir depois para multiempresa, cobrança e planos.</p>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Saldo atual</div>
                <div className="mt-2 text-3xl font-bold text-emerald-300">{money(summaryTotals.balance)}</div>
              </div>
              <div className="flex gap-2">
                <AppButton onClick={exportPDF} className="flex-1"><FileText className="mr-2 h-4 w-4" /> PDF</AppButton>
                <AppButton onClick={exportJSON} variant="outline" className="flex-1"><Download className="mr-2 h-4 w-4" /> JSON</AppButton>
                <AppButton onClick={handleLogout} variant="ghost"><LogOut className="h-4 w-4" /></AppButton>
              </div>
            </div>
          </div>
        </AppCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Entradas" value={money(summaryTotals.income)} icon={<TrendingUp className="h-5 w-5" />} tone="emerald" />
        <SummaryCard title="Saídas" value={money(summaryTotals.expense)} icon={<TrendingDown className="h-5 w-5" />} tone="rose" />
        <SummaryCard title="Saldo" value={money(summaryTotals.balance)} icon={<DollarSign className="h-5 w-5" />} tone="blue" />
        <SummaryCard title="Pendências" value={money(summaryTotals.pending)} icon={<Receipt className="h-5 w-5" />} tone="amber" />
      </motion.div>

      <div className="mb-6 grid w-full grid-cols-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-1">
        {(['dashboard', 'lancamentos', 'relatorios'] as TabMode[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${tab === item ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <AppCard>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-xl font-semibold"><BarChart3 className="h-5 w-5 text-blue-300" /> Evolução mensal do caixa</div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 16 }} />
                      <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={3} />
                      <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={3} />
                      <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AppCard>
            <AppCard>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-xl font-semibold"><PieChartIcon className="h-5 w-5 text-amber-300" /> Despesas por categoria</div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                        {expensesByCategory.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 16 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AppCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AppCard>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-xl font-semibold"><Users className="h-5 w-5 text-emerald-300" /> Top clientes por receita</div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topClients} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis type="category" dataKey="client" stroke="#94a3b8" width={110} />
                      <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 16 }} />
                      <Bar dataKey="total" radius={[0, 10, 10, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AppCard>
            <AppCard>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-xl font-semibold"><Calendar className="h-5 w-5 text-blue-300" /> Resumo operacional</div>
                <InfoRow label="Total de lançamentos" value={String(transactions.length)} />
                <InfoRow label="Entradas registradas" value={String(transactions.filter((t) => t.type === 'entrada').length)} />
                <InfoRow label="Saídas registradas" value={String(transactions.filter((t) => t.type === 'saida').length)} />
                <InfoRow label="Receitas pendentes" value={money(summaryTotals.pending)} />
                <InfoRow label="Maior cliente" value={topClients[0]?.client || '—'} />
              </div>
            </AppCard>
          </div>
        </div>
      )}

      {tab === 'lancamentos' && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <AppCard>
            <div className="grid gap-4 p-6">
              <div className="flex items-center gap-2 text-xl font-semibold"><Plus className="h-5 w-5 text-blue-300" /> Novo lançamento</div>
              <Field label="Descrição"><AppInput value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Ex.: Pagamento cliente X" /></Field>
              <Field label="Cliente / origem"><AppInput value={form.client} onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))} placeholder="Ex.: Clínica Bella Vita" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Valor"><AppInput type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} /></Field>
                <Field label="Data"><AppInput type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <AppSelect value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </AppSelect>
                </Field>
                <Field label="Status">
                  <AppSelect value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="recebido">Recebido</option>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </AppSelect>
                </Field>
              </div>
              <Field label="Categoria">
                <AppSelect value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </AppSelect>
              </Field>
              <AppButton onClick={handleAddTransaction} className="w-full">Adicionar lançamento</AppButton>
            </div>
          </AppCard>

          <AppCard>
            <div className="p-6">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xl font-semibold">Lançamentos</div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <AppInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar descrição, categoria ou cliente" className="pl-10" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 bg-transparent text-sm text-slate-200 outline-none">
                      <option value="todos">Todos</option>
                      <option value="entrada">Entradas</option>
                      <option value="saida">Saídas</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="h-10 bg-transparent text-sm text-slate-200 outline-none">
                      <option value="todos">Todos os meses</option>
                      {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={String(i + 1)}>{monthLabel(i + 1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {busyTransactions ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-10 text-center text-slate-400">Carregando lançamentos...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-10 text-center text-slate-400">Nenhum lançamento encontrado com os filtros atuais.</div>
                ) : (
                  filteredTransactions.map((item) => (
                    <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <div className="font-medium text-slate-100">{item.description}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-full border border-slate-800 px-2 py-1">{item.category}</span>
                          <span className="rounded-full border border-slate-800 px-2 py-1">{dateBR(item.date)}</span>
                          <span className="rounded-full border border-slate-800 px-2 py-1">{item.status}</span>
                          <span className="rounded-full border border-slate-800 px-2 py-1">{item.client || 'Sem cliente'}</span>
                        </div>
                      </div>
                      <div className={`text-right text-lg font-semibold ${item.type === 'entrada' ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {item.type === 'entrada' ? '+' : '-'} {money(item.amount)}
                      </div>
                      <div className="flex justify-end">
                        <AppButton variant="ghost" onClick={() => deleteTransaction(item.id)} className="px-3"><Trash2 className="h-4 w-4" /></AppButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AppCard>
        </div>
      )}

      {tab === 'relatorios' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <AppCard>
            <div className="space-y-4 p-6 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-xl font-semibold"><FileText className="h-5 w-5 text-blue-300" /> Relatório executivo</div>
              <ReportLine label="Receita total" value={money(summaryTotals.income)} />
              <ReportLine label="Despesa total" value={money(summaryTotals.expense)} />
              <ReportLine label="Saldo operacional" value={money(summaryTotals.balance)} />
              <ReportLine label="Pendências" value={money(summaryTotals.pending)} />
              <ReportLine label="Quantidade de lançamentos" value={String(transactions.length)} />
              <div className="pt-4"><AppButton onClick={exportPDF}><FileText className="mr-2 h-4 w-4" /> Gerar relatório PDF</AppButton></div>
            </div>
          </AppCard>

          <AppCard>
            <div className="space-y-4 p-6 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-xl font-semibold"><Download className="h-5 w-5 text-emerald-300" /> Exportação e continuidade</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">Os dados agora ficam salvos no Supabase e podem ser levados para produção na Vercel.</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">Use o arquivo SQL incluso no projeto para criar a tabela e as políticas RLS antes do deploy.</div>
              <AppButton onClick={exportJSON} variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar backup JSON</AppButton>
            </div>
          </AppCard>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return <div className="flex min-h-screen items-center justify-center text-slate-400">Carregando sistema...</div>;
}

function MissingConfigState() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
      <AppCard className="w-full">
        <div className="space-y-4 p-8">
          <div className="text-2xl font-bold">Supabase não configurado</div>
          <p className="text-slate-300">Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local para usar o sistema.</p>
        </div>
      </AppCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function SummaryCard({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: 'emerald' | 'rose' | 'blue' | 'amber' }) {
  const toneMap = {
    emerald: 'from-emerald-500/15 to-slate-900 text-emerald-300',
    rose: 'from-rose-500/15 to-slate-900 text-rose-300',
    blue: 'from-blue-500/15 to-slate-900 text-blue-300',
    amber: 'from-amber-500/15 to-slate-900 text-amber-300',
  };
  return (
    <AppCard className={`bg-gradient-to-br ${toneMap[tone]}`}>
      <div className="p-5">
        <div className="mb-4 inline-flex rounded-2xl bg-slate-950/40 p-3">{icon}</div>
        <div className="text-sm text-slate-400">{title}</div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-50">{value}</div>
      </div>
    </AppCard>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">{children}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
      <span className="text-slate-400">{label}</span>
      <strong className="text-slate-100">{value}</strong>
    </div>
  );
}

function ReportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}
