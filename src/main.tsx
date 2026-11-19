import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { btn } from './components/ui';
import { StoreProvider } from './lib/store';
import { ConceptNotebook } from './pages/ConceptNotebook';
import { Dashboard } from './pages/Dashboard';
import { PaperDetail } from './pages/PaperDetail';
import { PrintWorksheet } from './pages/PrintWorksheet';
import './index.css';

// Remount the detail page per paper so its tab state starts fresh.
function PaperDetailRoute() {
  const { id } = useParams();
  return <PaperDetail key={id} />;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-page px-10 py-20 text-center">
      <p className="text-lg font-semibold text-ink">페이지를 찾을 수 없어요.</p>
      <Link to="/" className={btn('secondary', 'mt-4')}>
        논문 목록으로
      </Link>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/papers/:id/print" element={<PrintWorksheet />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/papers/:id" element={<PaperDetailRoute />} />
            <Route path="/concepts" element={<ConceptNotebook />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
