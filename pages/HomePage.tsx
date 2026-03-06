
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Article, Category, FinancialIndicator } from '../types';
import { getVisibleArticles, getCategories, getFinancialIndicators } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import ArticleListItem from '../components/ArticleListItem';
import Carousel from '../components/Carousel';
import Spinner from '../components/Spinner';

const ARTICLES_PER_PAGE = 9;

const HomePage: React.FC = () => {
  const [carouselArticles, setCarouselArticles] = useState<Article[]>([]);
  const [importantArticles, setImportantArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<FinancialIndicator[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node && observer.current) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [fetchedCategories, topArticles, fetchedIndicators] = await Promise.all([
          getCategories(),
          getVisibleArticles({ limit: 10 }),
          getFinancialIndicators()
        ]);

        setCategories(fetchedCategories);
        setCarouselArticles(topArticles);
        setImportantArticles(topArticles.slice(0, 3));
        setIndicators(fetchedIndicators);

        const articlesByCat: Record<string, Article[]> = {};
        const allVisible = await getVisibleArticles({});
        for (const category of fetchedCategories) {
          const articles = allVisible.filter(a => a.category_id === category.id).slice(0, 4);
          if (articles.length > 0) {
            articlesByCat[category.id] = articles;
          }
        }
        setCategoryArticles(articlesByCat);

        const initialAllArticles = await getVisibleArticles({ page: 1, pageSize: ARTICLES_PER_PAGE });
        setAllArticles(initialAllArticles);
        if (initialAllArticles.length < ARTICLES_PER_PAGE) {
          setHasMore(false);
        }
        setPage(2);

      } catch (err) {
        setError('Failed to fetch news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (page > 1 && hasMore && !loading) {
      const fetchMoreArticles = async () => {
        setLoadingMore(true);
        try {
          const newArticles = await getVisibleArticles({ page: page, pageSize: ARTICLES_PER_PAGE });
          setAllArticles(prev => [...prev, ...newArticles]);
          if (newArticles.length < ARTICLES_PER_PAGE) {
            setHasMore(false);
          }
        } catch (err) {
          console.error("Error fetching more articles:", err);
        } finally {
          setLoadingMore(false);
        }
      };
      fetchMoreArticles();
    }
  }, [page, hasMore, loading]);

  const formatPrice = (ind: FinancialIndicator) => {
    let currency = 'USD';
    let style: 'currency' | 'decimal' = 'decimal';

    if (ind.id.includes('BTC') || ind.id.includes('SP') || ind.id.includes('ETH') || ind.id.includes('USDT')) {
      style = 'currency';
      currency = 'USD';
    } else if (ind.id.includes('EUR')) {
      style = 'currency';
      currency = 'EUR';
    } else if (ind.id.includes('BCV')) {
      // Para el dólar BCV a veces preferimos ver los decimales exactos
      return `Bs. ${ind.price.toFixed(4)}`;
    }

    return ind.price.toLocaleString('en-US', {
      style,
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: style === 'decimal' ? 4 : 2
    });
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="space-y-12">
      {/* Financial Ticker */}
      {indicators.length > 0 && (
        <div className="bg-[#475569] overflow-hidden py-3 rounded-xl mb-4 border border-[#64748b]/30 shadow-sm">
          <div className="flex animate-scroll whitespace-nowrap gap-12 px-6">
            {indicators.map((ind) => (
              <div key={ind.id} className="flex items-center gap-3">
                <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">{ind.id.replace('_BCV', '')}</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatPrice(ind)}
                </span>
                {ind.variation !== 0 && (
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${ind.variation >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {ind.variation >= 0 ? '▲' : '▼'} {Math.abs(ind.variation).toFixed(2)}%
                  </span>
                )}
              </div>
            ))}
            {/* Repeat for continuous effect */}
            {indicators.map((ind) => (
              <div key={`${ind.id}-dup`} className="flex items-center gap-3">
                <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">{ind.id.replace('_BCV', '')}</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatPrice(ind)}
                </span>
                {ind.variation !== 0 && (
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${ind.variation >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {ind.variation >= 0 ? '▲' : '▼'} {Math.abs(ind.variation).toFixed(2)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carousel */}
      {carouselArticles.length > 0 && <Carousel articles={carouselArticles} />}

      {/* Important Articles */}
      {importantArticles.length > 0 && (
        <section>
          <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 font-newsreader border-b mb-6">Noticias Importantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {importantArticles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Articles by Category */}
      {categories.map(category => (
        categoryArticles[category.id] && (
          <section key={category.id}>
            <div className="flex justify-between items-center px-4 pb-3 pt-5 border-b mb-4">
              <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] font-newsreader">
                {category.name}
              </h2>
              <Link to={`/category/${category.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                Ver más
              </Link>
            </div>
            <div className="space-y-4">
              {categoryArticles[category.id].map(article => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          </section>
        )
      ))}

      {/* All Articles - Infinite Scroll */}
      <section>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 font-newsreader border-b mb-6">Todas las Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allArticles.map((article, index) => {
            if (allArticles.length === index + 1) {
              return <div ref={lastArticleElementRef} key={article.id}><NewsCard article={article} /></div>
            }
            return <NewsCard key={article.id} article={article} />
          })}
        </div>
        {loadingMore && <Spinner />}
        {!hasMore && allArticles.length > 0 && <p className="text-center text-gray-500 mt-8 py-4 bg-gray-50 rounded-lg">Has llegado al final de las noticias.</p>}
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
