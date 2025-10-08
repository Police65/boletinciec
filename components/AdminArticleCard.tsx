import React from 'react';
import type { Article } from '../types';
import { ArticleStatus } from '../types';
import ProxiedImage from './ProxiedImage';
import { decodeHTMLEntities } from '../utils';

interface AdminArticleCardProps {
  article: Article;
  onStatusChange: (articleId: string, status: ArticleStatus) => void;
  onView: (article: Article) => void;
}

const AdminArticleCard: React.FC<AdminArticleCardProps> = ({ article, onStatusChange, onView }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col md:flex-row items-start gap-4">
      <ProxiedImage src={article.image_url} alt={decodeHTMLEntities(article.title)} className="w-full md:w-32 h-32 object-cover rounded" />
      <div className="flex-1">
        <span className="text-xs font-semibold uppercase text-gray-500">{article.category?.name || 'Sin Categoria'}</span>
        <h3 className="font-bold text-lg text-gray-800 mt-1">{decodeHTMLEntities(article.title)}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{decodeHTMLEntities(article.summary)}</p>
        <p className="text-xs text-gray-400 mt-2">Creado: {new Date(article.created_at).toLocaleString('es-VE')}</p>
      </div>
      <div className="flex flex-row md:flex-col gap-2 justify-start mt-2 md:mt-0 w-full md:w-auto">
         <button
          onClick={() => onView(article)}
          className="px-4 py-2 text-sm font-medium text-center text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 w-full"
        >
          Ver
        </button>
        <button
          onClick={() => onStatusChange(article.id, ArticleStatus.Approved)}
          className="px-4 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 w-full"
        >
          Aprobar
        </button>
        <button
          onClick={() => onStatusChange(article.id, ArticleStatus.Rejected)}
          className="px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 w-full"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
};

export default AdminArticleCard;