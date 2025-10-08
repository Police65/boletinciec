
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import NewsletterPage from './pages/NewsletterPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden text-[#111418]">
        <Header />
        <main className="flex flex-1 justify-center py-5">
           <div className="flex flex-col max-w-[960px] flex-1 w-full px-4">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
              </Routes>
           </div>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
