
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import NewsletterPage from './pages/NewsletterPage';
import Header from './components/Header';
import Footer from './components/Footer';
import IndicatorTicker from './components/IndicatorTicker';
import BCVWidget from './components/BCVWidget';

const AppContent = () => {
  const location = useLocation();
  const isNewsletterPage = location.pathname === '/newsletter';
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden text-[#111418]">
      <Header />
      <IndicatorTicker />
      <main className={`flex flex-1 ${isNewsletterPage ? '' : 'justify-center'} py-5`}>
        <div className={`flex flex-col lg:flex-row ${isNewsletterPage ? 'w-full' : 'max-w-[1280px] flex-1 w-full'} px-4 gap-8`}>
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/newsletter" element={<NewsletterPage />} />
            </Routes>
          </div>

          {!isNewsletterPage && !isAdminPage && (
            <aside className="hidden lg:block w-[300px] flex-shrink-0">
              <BCVWidget />
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
