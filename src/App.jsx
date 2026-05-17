import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/shop/CartDrawer';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { UpdatePrompt } from './components/ui/UpdatePrompt';
import { SystemAlert } from './components/ui/SystemAlert';
import { SizeGuideModal } from './components/shop/SizeGuideModal';
import { Home } from './pages/Home';
import { Maintenance } from './pages/Maintenance';
import { PromoPopup } from './components/ui/PromoPopup';
import { PushOptIn } from './components/ui/PushOptIn';
import { NewsletterPopup } from './components/layout/NewsletterPopup';
import { ShopAssistant } from './components/shop/ShopAssistant';
import React, { useLayoutEffect, useEffect, Suspense, lazy } from 'react';
import { startPresence } from './utils/presence';

// Lazy-loaded routes (code-splitting to shrink initial bundle)
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus').then(m => ({ default: m.PaymentStatus })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Tracking = lazy(() => import('./pages/Tracking').then(m => ({ default: m.Tracking })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then(m => ({ default: m.TermsConditions })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Success = lazy(() => import('./pages/Success').then(m => ({ default: m.Success })));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) return; // respetar anclas en la URL
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

// Bypass QA: ?qa=CLAVE saltea el gate de mantenimiento (para revisión
// visual/screenshots sin abrir la tienda al público). Se persiste en
// localStorage para sobrevivir la navegación SPA. Override por env.
const QA_BYPASS_KEY = import.meta.env.VITE_QA_BYPASS || 'lbde-qa-7f3a2c';

const hasQaBypass = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('qa');
    if (fromUrl && fromUrl === QA_BYPASS_KEY) {
      localStorage.setItem('qa_bypass', QA_BYPASS_KEY);
    }
    return localStorage.getItem('qa_bypass') === QA_BYPASS_KEY;
  } catch {
    return false;
  }
};

// AppContent assumes Router context exists
const AppContent = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen, isMaintenance, isAdmin, loading, incrementVisits, isCartOpen, setIsCartOpen, user } = useStore();

  // Use location here works because Router is now parent
  const location = useLocation();

  // Trigger visits exactly once on mount
  useEffect(() => { incrementVisits(); }, []);

  // Presence tracking (visitantes live) — ignora admin
  useEffect(() => {
    const stop = startPresence(user);
    return stop;
  }, [user]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-[#C19A6B]">Cargando...</div>;

  // Si está en mantenimiento y NO es admin, muestra pantalla de bloqueo
  if (isMaintenance && !isAdmin && !hasQaBypass()) {
    // Excepción: Permitir login de admin (ruta /admin) para que pueda entrar a apagarlo
    const isTryingToLogin = location.pathname.startsWith('/admin');
    if (!isTryingToLogin) return <Maintenance />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-500">
      <ScrollToTop />
      <NavbarWrapper onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {isSizeGuideOpen && <SizeGuideModal onClose={() => setIsSizeGuideOpen(false)} />}
      <ToastContainer />
      <ScrollProgress />
      <UpdatePrompt />
      <WhatsAppButton />
      <SystemAlert />
      <PromoPopup />
      <NewsletterPopup />
      {location.pathname !== '/admin' && <PushOptIn />}
      {/* Elegancia IA Chat Widget */}
      <ShopAssistantWrapper />
      <div className={`flex-grow ${location.pathname !== '/' && location.pathname !== '/shop' && !location.pathname.startsWith('/admin') ? 'pt-28' : ''}`}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/success" element={<Success />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <FooterWrapper />
    </div>
  );
};

const NavbarWrapper = ({ onOpenCart }) => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Navbar onOpenCart={onOpenCart} />;
};

const FooterWrapper = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') return null;
  return <Footer />;
};

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex items-center gap-3 text-[#C19A6B]">
      <div className="w-8 h-8 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm tracking-wide">Cargando…</span>
    </div>
  </div>
);

const ShopAssistantWrapper = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <ShopAssistant />;
};

// Error Boundary
class GlobalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) {
    // Reportar a Sentry si está configurado
    import('./lib/sentry').then(({ captureError }) => captureError(error, info)).catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, backgroundColor: '#000', color: 'red', height: '100vh', zIndex: 99999, position: 'relative' }}>
          <h1 style={{ fontSize: 24, marginBottom: 20 }}>Ha ocurrido un error crítico</h1>
          <pre style={{ backgroundColor: '#111', padding: 20, borderRadius: 8, overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: 4 }}>
            Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <StoreProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ConfirmProvider>
      </StoreProvider>
    </GlobalErrorBoundary>
  );
}
