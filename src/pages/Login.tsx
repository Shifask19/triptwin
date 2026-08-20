import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]   = useState('');
  const [password, setPassword]= useState('');
  const [showPwd,  setShowPwd] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try { await login(email, password); navigate('/', { replace: true }); }
    catch { /* displayed via context */ }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0A0A10' }}>

      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(108,71,255,0.18) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl btn-brand">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Your trip keeps getting<br />
            <span className="gradient-text">smarter while you travel.</span>
          </h1>
          <p className="text-[#8888A4] text-lg leading-relaxed mb-10">
            The world's first AI Travel Decision Engine that continuously monitors, optimises, and adapts your journey in real time.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[['TripSwap', 'Real-time plan optimization'], ['Travel Twin', 'AI that knows you'], ['Trap Detector', 'Smart value analysis']].map(([title, desc]) => (
              <div key={title} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-semibold text-[#A78BFA]">{title}</p>
                <p className="text-xs text-[#6B6B88] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md fade-up">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-brand">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TripTwin</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-[#8888A4] text-sm mb-8">Sign in to continue your journey</p>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#8888A4] mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
                <input id="email" type="email" autoComplete="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                  placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#8888A4] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
                <input id="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-dark w-full rounded-xl py-3 pl-10 pr-10 text-sm" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B88] hover:text-[#A78BFA] transition-colors"
                  aria-label="Toggle password">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white mt-2 disabled:opacity-50">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 rounded-xl px-4 py-3 text-xs text-[#6C47FF]"
            style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)' }}>
            <span className="font-semibold">Demo:</span> demo@triptwin.com / demo1234
          </div>

          <p className="mt-6 text-center text-sm text-[#6B6B88]">
            No account?{' '}
            <Link to="/register" className="font-medium text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
