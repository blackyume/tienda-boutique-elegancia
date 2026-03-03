import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/shop/CartDrawer';
import { ToastContainer } from './components/ui/ToastContainer';
import { SystemAlert } from './components/ui/SystemAlert';
import { SizeGuideModal } from './components/shop/SizeGuideModal';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { Tracking } from './pages/Tracking';
import { PaymentStatus } from './pages/PaymentStatus';
import { PromoPopup } from './components/ui/PromoPopup';
import { NewsletterPopup } from './components/layout/NewsletterPopup';


import { Shop } from './pages/Shop';
import { About } from './pages/About';
import { ProductDetail } from './pages/ProductDetail';
import { NotFound } from './pages/NotFound';
import { Maintenance } from './pages/Maintenance';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { Wishlist } from './pages/Wishlist';
import { UserProfile } from './pages/UserProfile';
import { ShopAssistant } from './components/shop/ShopAssistant';
import React, { useState, useLayoutEffect, useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// AppContent assumes Router context exists
const AppContent = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen, isMaintenance, isAdmin, loading, incrementVisits, isCartOpen, setIsCartOpen } = useStore();

  // Use location here works because Router is now parent
  const location = useLocation();

  // Trigger visits exactly once on mount
  useEffect(() => { incrementVisits(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-[#C19A6B]">Cargando...</div>;

  // Si está en mantenimiento y NO es admin, muestra pantalla de bloqueo
  if (isMaintenance && !isAdmin) {
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
      <SystemAlert />
      <PromoPopup />
      <NewsletterPopup />
      {/* Elegancia IA Chat Widget */}
      <ShopAssistantWrapper />
      <div className={`flex-grow ${location.pathname !== '/' && location.pathname !== '/shop' && !location.pathname.startsWith('/admin') ? 'pt-28' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          {/* <Route path="/success" element={<Success />} /> Removed until valid component exists */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <FooterWrapper />
    </div>
  );
};

// ... NavbarWrapper and FooterWrapper stay same ...

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

const ShopAssistantWrapper = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <ShopAssistant />;
};

// Error Boundary

class GlobalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StoreProvider>
    </GlobalErrorBoundary>
  );
}