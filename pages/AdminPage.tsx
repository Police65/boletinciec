import React, { useState, useEffect, useCallback } from 'react';
import type { Article } from '../types';
import { ArticleStatus } from '../types';
import { getPendingArticles, updateArticleStatus } from '../services/newsService';
import Spinner from '../components/Spinner';
import AdminArticleCard from '../components/AdminArticleCard';
import Modal from '../components/Modal';
import ProxiedImage from '../components/ProxiedImage';
import { decodeHTMLEntities } from '../utils';

const AdminPage: React.FC = () => {
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [previewArticle, setPreviewArticle] = useState<Article | null>(null);


    const loadData = useCallback(async () => {
        try {
            const articles = await getPendingArticles();
            setPendingArticles(articles);
        } catch (err) {
            setError('Failed to load admin data. Please refresh the page.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusChange = async (articleId: string, status: ArticleStatus) => {
        try {
            await updateArticleStatus(articleId, status);
            setPendingArticles(prev => prev.filter(a => a.id !== articleId));
            setLastMessage(`Artículo ${articleId} ha sido ${status}.`);
        } catch(err) {
            setError(`Failed to update status for article ${articleId}.`);
            console.error(err);
        }
    }

    if (loading) return <Spinner />;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6 font-newsreader border-b pb-2">Panel de Administración</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {lastMessage && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="status">{lastMessage}</div>}

            <section>
                <h2 className="text-2xl font-semibold mb-4 font-newsreader">Artículos Pendientes de Revisión ({pendingArticles.length})</h2>
                {pendingArticles.length > 0 ? (
                    <div className="space-y-4">
                        {pendingArticles.map(article => (
                            <AdminArticleCard 
                                key={article.id} 
                                article={article} 
                                onStatusChange={handleStatusChange} 
                                onView={() => setPreviewArticle(article)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg">No hay artículos pendientes.</p>
                )}
            </section>
            
            {previewArticle && (
                <Modal title={decodeHTMLEntities(previewArticle.title)} onClose={() => setPreviewArticle(null)}>
                    <div className="prose prose-lg max-w-none text-[#111418]">
                        <p className="text-lg text-[#637588] mb-4">{decodeHTMLEntities(previewArticle.summary)}</p>
                         <ProxiedImage
                            src={previewArticle.image_url}
                            alt={decodeHTMLEntities(previewArticle.title)}
                            className="w-full h-auto max-h-[400px] object-cover rounded-lg my-4"
                        />
                        <div dangerouslySetInnerHTML={{ __html: previewArticle.body.replace(/\n/g, '<p>') }} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminPage;