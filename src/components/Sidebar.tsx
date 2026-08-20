import { NavLink, useNavigate } from 'react-router-dom';
import {
  Map, Zap, Brain, Search, Compass,
  Clock, DollarSign, Shield, Home, LogOut, Globe,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',              icon: Home,       label: 'Dashboard'     },
  { to: '/destinations',  icon: Globe,      label: 'Destinations'  },
  { to: '/itinerary',     icon: Map,        label: 'Itinerary'     },
  { to: '/tripswap',      icon: Zap,        label: 'TripSwap'      },
  { to: '/travel-twin',   icon: Brain,      label: 'Travel Twin'   },
  { to: '/trap-detector', icon: Shield,     label: 'Trap Detector' },
  { to: '/search',        icon: Search,     label: 'Smart Search'  },
  { to: '/now',           icon: Compass,    label: 'What Now?'     },
  { to: '/budget',        icon: DollarSign, label: 'Budget'        },
  { to: '/memory',        icon: Clock,      label: 'Travel Memory' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col lg:w-60"
      style={{ background: 'linear-gradient(180deg,#0F0F18 0%,#0A0A12 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center justify-center gap-2.5 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl btn-brand">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="hidden lg:block">
          <p className="text-base font-bold text-white tracking-tight">TripTwin</p>
          <p className="text-[10px] text-[#6C47FF] font-medium -mt-0.5">Travel Decision Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'nav-active'
                  : 'text-[#6B6B88] hover:bg-white/5 hover:text-[#C0C0D8]'
              )
            }
          >
            <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 px-2 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {user && (
          <div className="hidden lg:flex items-center gap-2.5 px-2.5 py-2.5 mt-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#7C5CFF,#6C47FF)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#E8E8F0]">{user.name}</p>
              <p className="truncate text-[10px] text-[#6B6B88]">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-[#6B6B88] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut style={{ width: 16, height: 16 }} className="flex-shrink-0" />
          <span className="hidden lg:block text-sm">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
