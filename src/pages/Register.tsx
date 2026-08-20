import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8,    label: '8+ characters' },
    { ok: /\d/.test(password),     label: 'Contains number' },
    { ok: /[a-zA-Z]/.test(password), label: 'Contains letter' },
  ];
  const score = checks.filter(c => c.ok).length;
  if (!password) return null;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : 'bg-white/8'}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-emerald-400' : 'text-[#6B6B88]'}`}>
            <CheckCircle className="h-3 w-3" />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Register() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [name,     setName]    = useState('');
  const [email,    setEmail]   = useState('');
  const [password, setPassword]= useState('');
  const [showPwd,  setShowPwd] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (password.length < 8) return;
    try { await register(email, password, name); navigate('/', { replace: true }); }
    catch { /* displayed via context */ }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12" style={{ background: '#0A0A10' }}>
      <div className="w-full max-w-md fade-up">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-brand">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TripTwin</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create your Travel Twin</h2>
        <p className="text-[#8888A4] text-sm mb-8">Gets smarter with every trip you take.</p>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8888A4] mb-1.5">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
              <input type="text" autoComplete="name" required value={name}
                onChange={e => setName(e.target.value)}
                className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="Alex Chen" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8888A4] mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
              <input type="email" autoComplete="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8888A4] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
              <input type={showPwd ? 'text' : 'password'} autoComplete="new-password" required
                minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                className="input-dark w-full rounded-xl py-3 pl-10 pr-10 text-sm" placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B88] hover:text-[#A78BFA]"
                aria-label="Toggle password">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <StrengthBar password={password} />
          </div>

          <button type="submit" disabled={loading}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white mt-2 disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B6B88]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#A78BFA] hover:text-[#C4B5FD]">Sign in</Link>
        </p>
        <p className="mt-3 text-center text-xs text-[#4B4B60]">
          Your data is encrypted. Never sold. Always yours.
        </p>
      </div>
    </div>
  );
}
