import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { getWeeklyApprovedArticles, getFinancialIndicators, getDailyIndicators } from '../services/newsService';
import { generateWeeklySummary } from '../services/geminiService';
import type { Article, FinancialIndicator, DailyIndicator } from '../types';
import NewsletterDocument from '../components/NewsletterDocument';
import Spinner from '../components/Spinner';
import ProxiedImage from '../components/ProxiedImage';
import { decodeHTMLEntities } from '../utils';
import { CIEC_LOGO_URL } from '../assets';

const NewsletterPage: React.FC = () => {
    const [weeklyArticles, setWeeklyArticles] = useState<Article[]>([]);
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
    const [indicators, setIndicators] = useState<FinancialIndicator[]>([]);
    const [dailyIndicators, setDailyIndicators] = useState<DailyIndicator[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [editSummaryText, setEditSummaryText] = useState<string>('');

    useEffect(() => {
        const loadNewsletterData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [articles, indicatorsData, dailyIndicatorsData] = await Promise.all([
                    getWeeklyApprovedArticles(),
                    getFinancialIndicators(),
                    getDailyIndicators()
                ]);
                setWeeklyArticles(articles);
                setIndicators(indicatorsData);
                setDailyIndicators(dailyIndicatorsData);

                // Initialize all articles as selected by default
                const initialSelected = new Set(articles.map(a => a.id));
                setSelectedArticleIds(initialSelected);

                if (articles.length > 0) {
                    const generatedSummary = await generateWeeklySummary(articles);
                    setSummary(generatedSummary);
                }
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el boletín. Por favor, intente de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        loadNewsletterData();
    }, []);

    const toggleArticleSelection = (id: string) => {
        const newSelected = new Set(selectedArticleIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedArticleIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedArticleIds.size === weeklyArticles.length) {
            setSelectedArticleIds(new Set());
        } else {
            setSelectedArticleIds(new Set(weeklyArticles.map(a => a.id)));
        }
    };

    // Filter articles based on selection
    const visibleArticles = weeklyArticles.filter(a => selectedArticleIds.has(a.id));

    const getWeekDateRange = () => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        // FIX: Corrected typo `toLocaleDateDateString` to `toLocaleDateString`.
        return `${sevenDaysAgo.toLocaleDateString('es-VE', options)} - ${today.toLocaleDateString('es-VE', options)}`;
    }

    const articlesByCategory = weeklyArticles.reduce((acc, article) => {
        const categoryName = article.category?.name || 'Sin Categoría';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(article);
        return acc;
    }, {} as Record<string, Article[]>);

    const handleEditClick = (article: Article) => {
        setEditingArticle(article);
        setEditSummaryText(decodeHTMLEntities(article.summary));
    };

    const handleSaveSummary = () => {
        if (!editingArticle) return;

        const updatedArticles = weeklyArticles.map(a =>
            a.id === editingArticle.id ? { ...a, summary: editSummaryText } : a
        );
        setWeeklyArticles(updatedArticles);
        setEditingArticle(null);
        setEditSummaryText('');
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold font-newsreader">Generador de Boletín</h1>

                <PDFDownloadLink
                    document={
                        <NewsletterDocument
                            articles={visibleArticles}
                            summary={summary}
                            indicators={indicators}
                            dailyIndicators={dailyIndicators}
                            dateRange={getWeekDateRange()}
                        />
                    }
                    fileName={`boletin_ciec_${getWeekDateRange().replace(/ /g, '_').replace(/\//g, '-')}.pdf`}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium ${loading || visibleArticles.length === 0 ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    {({ loading: pdfLoading }) => (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152a8,8,0,0,1,16,0v48H200V152a8,8,0,0,1,16,0ZM128,152a8,8,0,0,0,5.66-2.34l32-32a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32A8,8,0,0,0,128,152Z"></path>
                            </svg>
                            {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
                        </>
                    )}
                </PDFDownloadLink>
            </div>








            {loading ? <Spinner /> : (
                <>
                    {weeklyArticles.length === 0 ? (
                        <p className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg">No hay noticias aprobadas en la última semana para generar el boletín.</p>
                    ) : (
                        <div className="w-full">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-gray-200 pb-4">
                                <div>
                                    <h2 className="text-3xl font-bold font-newsreader text-gray-900">Boletín Semanal</h2>
                                    <p className="text-gray-600 mt-1">{getWeekDateRange()}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center gap-4">
                                    <button onClick={toggleSelectAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        {selectedArticleIds.size === weeklyArticles.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                    </button>
                                </div>
                            </div>



                            {/* AI Summary */}
                            <section className="mb-8">
                                <h3 className="text-xl font-bold font-newsreader text-gray-800 border-b mb-3 pb-2">Resumen Ejecutivo</h3>
                                {summary ? (
                                    <p
                                        className="text-gray-700 whitespace-pre-line"
                                        dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    />
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-line">Generando resumen...</p>
                                )}
                            </section>

                            {/* Articles */}
                            <section>
                                {Object.entries(articlesByCategory).map(([categoryName, articles]) => (
                                    <div key={categoryName} className="mb-8 break-after-page">
                                        <h3 className="text-xl font-bold font-newsreader text-gray-800 border-b-2 border-blue-200 mb-4 pb-2">{categoryName}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                            {(articles as Article[]).map(article => {
                                                const isSelected = selectedArticleIds.has(article.id);
                                                return (
                                                    <div
                                                        key={article.id}
                                                        className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative h-full ${isSelected ? 'opacity-100 ring-1 ring-gray-200' : 'opacity-60 grayscale ring-1 ring-gray-100'}`}
                                                    >
                                                        {/* Checkbox Overlay */}
                                                        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                            <div className="bg-white rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleArticleSelection(article.id)}
                                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer block"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image */}
                                                        <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
                                                            <ProxiedImage
                                                                src={article.image_url}
                                                                alt={decodeHTMLEntities(article.title)}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-4 flex flex-col flex-grow">
                                                            <Link to={`/article/${article.id}`} target="_blank" className="hover:text-blue-600 mb-2 block">
                                                                <h4 className="text-base font-bold leading-tight text-gray-900 line-clamp-3">
                                                                    {decodeHTMLEntities(article.title)}
                                                                </h4>
                                                            </Link>

                                                            <div className="flex justify-between items-center mb-3">
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    {new Date(article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleEditClick(article);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
                                                                    Editar
                                                                </button>
                                                            </div>

                                                            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed flex-grow">
                                                                {decodeHTMLEntities(article.summary)}
                                                            </p>

                                                            {!isSelected && (
                                                                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Excluido
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    )}
                </>
            )
            }

            {/* Edit Modal */}
            {editingArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Editar Resumen</h3>
                            <button onClick={() => setEditingArticle(null)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                            </button>
                        </div>

                        <div className="p-4 flex-grow overflow-y-auto">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Título Original</h4>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{decodeHTMLEntities(editingArticle.title)}</p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">Resumen para el PDF</label>
                            <textarea
                                value={editSummaryText}
                                onChange={(e) => setEditSummaryText(e.target.value)}
                                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed resize-none"
                                placeholder="Escriba el resumen corregido aquí..."
                            />
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {editSummaryText.length} caracteres
                            </p>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingArticle(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSummary}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default NewsletterPage;
