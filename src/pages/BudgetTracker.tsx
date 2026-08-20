import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Utensils, Car, Ticket, ShoppingBag, Bed } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

const CATS = [
  { key: 'accommodation', label: 'Accommodation', icon: Bed,         color: '#6C47FF' },
  { key: 'food',          label: 'Food & Dining',  icon: Utensils,    color: '#f59e0b' },
  { key: 'transport',     label: 'Transport',      icon: Car,         color: '#38BDF8' },
  { key: 'activities',    label: 'Activities',     icon: Ticket,      color: '#10b981' },
  { key: 'shopping',      label: 'Shopping',       icon: ShoppingBag, color: '#A78BFA' },
] as const;

type BK = typeof CATS[number]['key'];

const tooltipStyle = { background: '#1E1E2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#E8E8F0', fontSize: 12 };

export function BudgetTracker() {
  const { trip } = useTripStore();
  const { budget } = trip;

  const totalSpent  = Object.values(budget.spent).reduce((a,b) => Number(a)+Number(b), 0) as number;
  const totalBudget = Number(budget.total);
  const remaining   = totalBudget - totalSpent;
  const spentPct    = Math.round((totalSpent / totalBudget) * 100);
  const expectedPct = 28;
  const variance    = spentPct - expectedPct;

  const pieData = CATS.map(c => ({ name: c.label, value: Number(budget.spent[c.key as BK]), color: c.color })).filter(d => d.value > 0);
  const barData = CATS.map(c => ({ name: c.label.split(' ')[0], Budgeted: Number(budget[c.key as BK]), Spent: Number(budget.spent[c.key as BK]) }));

  const suggestions = [
    { cat: 'Food',       msg: '3 highly-rated local spots nearby for $15–22 (vs $35 avg)',   saving: 40 },
    { cat: 'Activities', msg: 'Intermediatheque Museum — free, same quality as TeamLab',       saving: 32 },
  ];

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
          <DollarSign className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Tracker</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Smart spending intelligence — every dollar tracked, every overspend flagged.</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Budget', value: `$${totalBudget}`, color: '#E8E8F0' },
          { label: 'Spent So Far', value: `$${totalSpent}`,  color: '#f59e0b' },
          { label: 'Remaining',    value: `$${remaining}`,   color: remaining < 400 ? '#ef4444' : '#10b981' },
          { label: 'vs Expected',  value: `${variance > 0 ? '+' : ''}${variance}%`, color: variance > 10 ? '#ef4444' : variance > 0 ? '#f59e0b' : '#10b981' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center glass">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#8888A4] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main progress */}
      <div className="rounded-2xl p-5 glass">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#E8E8F0]">Overall budget used</span>
          <span className="font-bold text-lg" style={{ color: spentPct > 80 ? '#ef4444' : '#10b981' }}>{spentPct}%</span>
        </div>
        <ProgressBar value={spentPct} color={spentPct > 80 ? 'red' : spentPct > 60 ? 'amber' : 'emerald'} size="md" />
        <div className="mt-3 flex items-center gap-2">
          {variance > 10
            ? <Badge variant="red"><AlertTriangle className="h-3 w-3" /> Spending faster than planned</Badge>
            : <Badge variant="green"><CheckCircle className="h-3 w-3" /> On track</Badge>}
          <span className="text-xs text-[#6B6B88]">Day 2 of 7 — expected {expectedPct}% spent</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Category bars */}
        <div className="rounded-2xl p-5 glass space-y-4">
          <h2 className="font-semibold text-[#E8E8F0]">By Category</h2>
          {CATS.map(({ key, label, icon: Icon, color }) => {
            const budgeted = Number(budget[key as BK]);
            const spent    = Number(budget.spent[key as BK]);
            const pct      = Math.round((spent / budgeted) * 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color }} />
                    <span className="text-sm text-[#C0C0D8]">{label}</span>
                  </div>
                  <span className="text-xs text-[#8888A4]">${spent} / ${budgeted}</span>
                </div>
                <ProgressBar value={pct} color={pct > 90 ? 'red' : pct > 70 ? 'amber' : 'emerald'} />
              </div>
            );
          })}
        </div>

        {/* Pie chart */}
        <div className="rounded-2xl p-5 glass">
          <h2 className="font-semibold text-[#E8E8F0] mb-4">Spending Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${(name ?? '').split(' ')[0]} ${Math.round((percent ?? 0) * 100)}%`}
                labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`$${v}`, 'Spent']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl p-5 glass">
        <h2 className="font-semibold text-[#E8E8F0] mb-4">Budgeted vs Actual</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barGap={4}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8888A4' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8888A4' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => `$${v}`} />
            <Bar dataKey="Budgeted" fill="rgba(255,255,255,0.08)" radius={[6,6,0,0]} />
            <Bar dataKey="Spent"    fill="#6C47FF"                radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart suggestions */}
      <div>
        <h2 className="font-semibold text-[#E8E8F0] mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#A78BFA]" />Smart saving suggestions
        </h2>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl px-4 py-3 glass"
              style={{ border: '1px solid rgba(108,71,255,0.2)' }}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#E8E8F0]">{s.cat}</p>
                <p className="text-xs text-[#8888A4] mt-0.5">{s.msg}</p>
              </div>
              <Badge variant="green">Save ${s.saving}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
