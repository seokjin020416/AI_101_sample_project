import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { summary } from '../lib/logic';
import { useStore } from '../lib/store';
import type { Paper } from '../lib/types';
import { PaperFormModal } from './PaperFormModal';
import { Icon, Toasts, btn } from './ui';

interface PaperFormCtx {
  openAdd: () => void;
  openEdit: (p: Paper) => void;
}

const FormContext = createContext<PaperFormCtx | null>(null);

export function usePaperForm(): PaperFormCtx {
  const v = useContext(FormContext);
  if (!v) throw new Error('usePaperForm must be used inside Layout');
  return v;
}

function NavItem({ to, children, end }: { to: string; children: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded px-3 py-2 text-[15px] font-semibold transition-colors ${isActive ? 'bg-tint-strong text-ink' : 'text-ink-3 hover:bg-tint hover:text-ink'}`
      }
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  const { data } = useStore();
  const location = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Paper | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((p: Paper) => {
    setEditing(p);
    setFormOpen(true);
  }, []);
  const ctx = useMemo(() => ({ openAdd, openEdit }), [openAdd, openEdit]);

  const s = summary(data);
  // "현재 리딩" = most recently touched paper still in progress
  const current = [...data.papers]
    .filter((p) => p.status !== 'pass3' && p.status !== 'onhold')
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const onCurrent = current && location.pathname === `/papers/${current.id}`;

  return (
    <FormContext.Provider value={ctx}>
      <div className="flex min-h-screen flex-col bg-canvas">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur print:hidden">
          <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-10">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="" className="h-8 w-8" />
              <span className="leading-none">
                <span className="block font-serif text-[22px] font-semibold text-ink">PaperPass</span>
                <span className="block font-mono text-[10px] tracking-[0.18em] text-ink-4">3-PASS PAPER NOTE</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavItem to="/" end>
                논문 목록
              </NavItem>
              <NavItem to="/concepts">개념 노트</NavItem>
              {current ? (
                <Link
                  to={`/papers/${current.id}`}
                  title={current.title}
                  className={`rounded px-3 py-2 text-[15px] font-semibold transition-colors ${onCurrent ? 'bg-tint-strong text-ink' : 'text-ink-3 hover:bg-tint hover:text-ink'}`}
                >
                  현재 리딩
                </Link>
              ) : (
                <span className="cursor-not-allowed px-3 py-2 text-[15px] font-semibold text-ink-5" title="읽는 중인 논문이 없어요">
                  현재 리딩
                </span>
              )}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs text-ink-3">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  읽는 중 <b className="text-ink">{s.reading}</b>
                </span>
                <span className="text-ink-5">·</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-st-understood" />
                  완료 <b className="text-ink">{s.done}</b>
                </span>
                <span className="text-ink-5">·</span>
                <Link to="/concepts" className="flex items-center gap-1 hover:text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-st-unknown" />
                  미해결 개념 <b className="text-st-unknown">{s.unresolved}</b>
                </Link>
              </div>
              <button type="button" onClick={openAdd} className={btn('primary')}>
                <Icon name="plus" /> 논문 추가
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-white print:hidden">
          <div className="mx-auto flex max-w-page items-center justify-between px-10 py-5 font-mono text-xs text-ink-4">
            <span>S. Keshav 3-Pass Method · 데이터는 이 브라우저(localStorage)에만 저장됩니다</span>
            <span>PaperPass v0.1</span>
          </div>
        </footer>
      </div>
      <PaperFormModal open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <Toasts />
    </FormContext.Provider>
  );
}
