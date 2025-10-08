import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Article } from '../types';
import { getArticleById } from '../services/newsService';
import Spinner from '../components/Spinner';
import ProxiedImage from '../components/ProxiedImage';
import { decodeHTMLEntities } from '../utils';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const articleData = await getArticleById(id);
          if (articleData) {
            setArticle(articleData);
          } else {
            setError('Article not found.');
          }
        } catch (err) {
          setError('Failed to fetch article.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 text-xl">{error}</p>;
  if (!article) return <p className="text-center text-gray-500">Article could not be loaded.</p>;

  return (
    <article className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8">
      <header>
        {article.category && (
          <Link to={`/category/${article.category.id}`} className="text-blue-600 uppercase font-bold text-sm hover:underline">
            {article.category.name}
          </Link>
        )}
        <h1 className="text-3xl md:text-5xl font-bold text-[#111418] mt-2 mb-4 leading-tight font-newsreader">
          {decodeHTMLEntities(article.title)}
        </h1>
        <p className="text-lg text-[#637588] mb-4">{decodeHTMLEntities(article.summary)}</p>
        <div className="text-sm text-gray-400">
          Publicado el {new Date(article.created_at).toLocaleDateString('es-VE')}
        </div>
        {article.source_url && (() => {
            let sourceName = 'la fuente original';
            try {
                sourceName = new URL(article.source_url).hostname.replace(/^www\./, '');
            } catch (e) {
                console.error('Invalid source URL for article:', article.source_url);
            }
            return (
                <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p>
                        <strong>Fuente Original:</strong> <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{sourceName}</a>
                    </p>
                    <p className="italic mt-1">
                        Nota: Este artículo es un resumen generado automáticamente y no fue redactado por el equipo de CIEC.
                    </p>
                </div>
            );
        })()}
      </header>
      <ProxiedImage
        src={article.image_url}
        alt={decodeHTMLEntities(article.title)}
        className="w-full h-auto max-h-[500px] object-cover rounded-lg my-8"
      />
      <div
        className="prose prose-lg max-w-none text-[#111418]"
        dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<p>') }}
      />
    </article>
  );
};

export default ArticlePage;