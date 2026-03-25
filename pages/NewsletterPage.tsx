import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { getApprovedArticlesByDateRange, getFinancialIndicators, getDailyIndicators } from '../services/newsService';
import type { Article, FinancialIndicator, DailyIndicator } from '../types';
import NewsletterDocument from '../components/NewsletterDocument';
import Spinner from '../components/Spinner';
import ProxiedImage from '../components/ProxiedImage';
import { decodeHTMLEntities } from '../utils';

type FilterType = 'day' | 'week' | 'month' | 'custom';

const NewsletterPage: React.FC = () => {
    const [weeklyArticles, setWeeklyArticles] = useState<Article[]>([]);
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
    const [indicators, setIndicators] = useState<FinancialIndicator[]>([]);
    const [dailyIndicators, setDailyIndicators] = useState<DailyIndicator[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [editSummaryText, setEditSummaryText] = useState<string>('');
    const [featuredArticles, setFeaturedArticles] = useState<Record<string, string>>({});
    const [confirmFeatured, setConfirmFeatured] = useState<{ categoryName: string, articleId: string } | null>(null);

    // Date filters state
    const [filterType, setFilterType] = useState<FilterType>('week');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

    const getDateRange = () => {
        const endObj = new Date();
        endObj.setHours(23, 59, 59, 999);

        const startObj = new Date();
        startObj.setHours(0, 0, 0, 0);

        if (filterType === 'day') {
            // start is today
        } else if (filterType === 'week') {
            startObj.setDate(endObj.getDate() - 7);
        } else if (filterType === 'month') {
            startObj.setDate(endObj.getDate() - 30);
        } else if (filterType === 'custom') {
            if (customStartDate) startObj.setTime(new Date(customStartDate + 'T00:00:00').getTime());
            if (customEndDate) endObj.setTime(new Date(customEndDate + 'T23:59:59').getTime());
        }

        return { start: startObj.toISOString(), end: endObj.toISOString(), startObj, endObj };
    };

    useEffect(() => {
        const loadNewsletterData = async () => {
            if (filterType === 'custom' && (!customStartDate || !customEndDate)) return;

            try {
                setLoading(true);
                setError(null);

                const { start, end } = getDateRange();

                const [articles, indicatorsData, dailyIndicatorsData] = await Promise.all([
                    getApprovedArticlesByDateRange(start, end),
                    getFinancialIndicators(),
                    getDailyIndicators()
                ]);
                setWeeklyArticles(articles);
                setIndicators(indicatorsData);
                setDailyIndicators(dailyIndicatorsData);

                // Initialize all articles as selected by default
                const initialSelected = new Set(articles.map(a => a.id));
                setSelectedArticleIds(initialSelected);

                // Set initial featured article per category if empty
                setFeaturedArticles(prev => {
                    const newFeatured = { ...prev };
                    articles.forEach(a => {
                        const catName = a.category?.name || 'Sin Categoría';
                        if (!newFeatured[catName]) {
                            newFeatured[catName] = a.id;
                        }
                    });
                    return newFeatured;
                });

            } catch (err: any) {
                console.error('Load Error:', err);
                setError(`Error: ${err?.message || err?.error_description || JSON.stringify(err) || 'Desconocido'}`);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(loadNewsletterData, 300);
        return () => clearTimeout(debounceTimer);
    }, [filterType, customStartDate, customEndDate]);

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

    const handleSetFeatured = (categoryName: string, articleId: string) => {
        setFeaturedArticles(prev => ({ ...prev, [categoryName]: articleId }));
    };

    const visibleArticles = weeklyArticles.filter(a => selectedArticleIds.has(a.id));

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

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const { startObj, endObj } = getDateRange();
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const isSingleDay = filterType === 'day' || (startObj.getDate() === endObj.getDate() && startObj.getMonth() === endObj.getMonth() && startObj.getFullYear() === endObj.getFullYear());
            const startStr = startObj.toLocaleDateString('es-VE', options);
            const dateRangeStr = isSingleDay 
                ? `Boletín generado en el día ${startStr}` 
                : `${startStr} - ${endObj.toLocaleDateString('es-VE', options)}`;
            const fileDateRangeStr = isSingleDay ? startStr : `${startStr} - ${endObj.toLocaleDateString('es-VE', options)}`;

            const doc = <NewsletterDocument
                articles={visibleArticles}
                indicators={indicators}
                dailyIndicators={dailyIndicators}
                dateRange={dateRangeStr}
                featuredArticles={featuredArticles}
            />;

            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `boletin_ciec_${fileDateRangeStr.replace(/ /g, '_').replace(/\//g, '-')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Ocurrió un error al generar el PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const { startObj, endObj } = getDateRange();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const isSingleDay = filterType === 'day' || (startObj.getDate() === endObj.getDate() && startObj.getMonth() === endObj.getMonth() && startObj.getFullYear() === endObj.getFullYear());
    const dateRangeStrUI = isSingleDay 
        ? `Boletín generado en el día ${startObj.toLocaleDateString('es-VE', options)}` 
        : `${startObj.toLocaleDateString('es-VE', options)} - ${endObj.toLocaleDateString('es-VE', options)}`;

    return (
        <div className="w-full relative">
            {isGeneratingPdf && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Generando Boletín</h3>
                        <p className="text-gray-600 text-center text-sm">Su Boletín de noticias está siendo generado, se descargará en breve...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                <h1 className="text-3xl font-bold font-newsreader">Generador de Boletín</h1>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                        >
                            <option value="day">Noticias del Día</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mes</option>
                            <option value="custom">Personalizado</option>
                        </select>

                        {filterType === 'custom' && (
                            <div className="flex gap-2 items-center w-full">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={e => setCustomStartDate(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                />
                                <span className="text-gray-500 font-medium whitespace-nowrap">a</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={e => setCustomEndDate(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={loading || visibleArticles.length === 0 || isGeneratingPdf}
                        className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm font-medium w-full sm:w-auto whitespace-nowrap transition-colors ${(loading || visibleArticles.length === 0) ? 'opacity-50' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152a8,8,0,0,1,16,0v48H200V152a8,8,0,0,1,16,0ZM128,152a8,8,0,0,0,5.66-2.34l32-32a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32A8,8,0,0,0,128,152Z"></path>
                        </svg>
                        Descargar Boletín PDF
                    </button>
                </div>
            </div>

            {loading ? <Spinner /> : error ? (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 flex items-center gap-2">
                    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    {error}
                </div>
            ) : (
                <>
                    {weeklyArticles.length === 0 ? (
                        <p className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg mt-8 font-medium">No hay noticias aprobadas en el rango de fechas seleccionado.</p>
                    ) : (
                        <div className="w-full">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-gray-200 pb-4">
                                <div>
                                    <h2 className="text-3xl font-bold font-newsreader text-gray-900">Listado de Noticias</h2>
                                    <p className="text-gray-600 mt-1 capitalize">{dateRangeStrUI}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center gap-4">
                                    <button onClick={toggleSelectAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                                        {selectedArticleIds.size === weeklyArticles.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                    </button>
                                </div>
                            </div>



                            <section>
                                {Object.entries(articlesByCategory).map(([categoryName, articles]) => (
                                    <div key={categoryName} className="mb-10">
                                        <h3 className="text-2xl font-bold font-newsreader text-gray-800 border-b-2 border-blue-600 mb-6 pb-2 inline-block">{categoryName}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                            {(articles as Article[]).map(article => {
                                                const isSelected = selectedArticleIds.has(article.id);
                                                const isFeatured = featuredArticles[categoryName] === article.id;
                                                return (
                                                    <div
                                                        key={article.id}
                                                        className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative h-full ${isSelected ? 'opacity-100 border border-blue-100 ring-2 ring-transparent hover:ring-blue-100' : 'opacity-50 grayscale border border-gray-200'} ${isFeatured && isSelected ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
                                                    >
                                                        <div className="absolute top-3 right-3 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            {isSelected && (
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setConfirmFeatured({ categoryName, articleId: article.id });
                                                                    }}
                                                                    className={`bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${isFeatured ? 'border-yellow-400 text-yellow-500' : 'border-gray-100 text-gray-400 hover:text-yellow-500'}`}
                                                                    title="Hacer encabezado principal"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path></svg>
                                                                </div>
                                                            )}
                                                            <div className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleArticleSelection(article.id)}
                                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer block"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="relative h-48 w-full bg-gray-100 flex-shrink-0 overflow-hidden">
                                                            <ProxiedImage
                                                                src={article.image_url}
                                                                alt={decodeHTMLEntities(article.title)}
                                                                className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'hover:scale-105' : ''}`}
                                                            />
                                                        </div>

                                                        <div className="p-5 flex flex-col flex-grow">
                                                            <Link to={`/article/${article.id}`} target="_blank" className="hover:text-blue-600 mb-3 block group">
                                                                <h4 className="text-base font-bold leading-snug text-gray-900 line-clamp-3 group-hover:underline decoration-blue-500 decoration-2 underline-offset-2">
                                                                    {decodeHTMLEntities(article.title)}
                                                                </h4>
                                                            </Link>

                                                            <div className="flex justify-between items-center mb-4">
                                                                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                    {new Date(article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleEditClick(article);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
                                                                    Editar
                                                                </button>
                                                            </div>

                                                            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed flex-grow">
                                                                {decodeHTMLEntities(article.summary)}
                                                            </p>

                                                            {!isSelected && (
                                                                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                                                        No incluir en PDF
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
            )}

            {editingArticle && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="font-bold text-gray-900 text-lg">Editar Resumen</h3>
                            <button onClick={() => setEditingArticle(null)} className="text-gray-400 hover:text-gray-900 transition-colors bg-white hover:bg-gray-100 p-1.5 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 flex-grow overflow-y-auto">
                            <div className="mb-5">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Título Original</h4>
                                <p className="text-sm font-semibold text-gray-900 leading-snug">{decodeHTMLEntities(editingArticle.title)}</p>
                            </div>

                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen para el PDF</label>
                            <textarea
                                value={editSummaryText}
                                onChange={(e) => setEditSummaryText(e.target.value)}
                                className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed resize-none shadow-sm transition-shadow hover:shadow-md"
                                placeholder="Escriba el resumen corregido aquí..."
                            />
                            <p className="text-xs text-gray-500 mt-2 flex justify-end font-medium">
                                <span className={editSummaryText.length > 500 ? 'text-orange-500' : ''}>{editSummaryText.length}</span> / Recomendado: ~500 caracteres
                            </p>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingArticle(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSummary}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm shadow-blue-500/30 transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Featured Modal */}
            {confirmFeatured && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col p-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path></svg>
                            </div>
                            <h3 className="font-bold text-gray-900 text-xl">Destacar Noticia</h3>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            ¿Estás seguro de que deseas establecer esta noticia como el encabezado principal de la categoría <span className="font-bold text-gray-800">"{confirmFeatured.categoryName}"</span> en el PDF resultante?
                        </p>
                        <div className="flex justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setConfirmFeatured(null)}
                                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100/80 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    handleSetFeatured(confirmFeatured.categoryName, confirmFeatured.articleId);
                                    setConfirmFeatured(null);
                                }}
                                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all"
                            >
                                Sí, Destacar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterPage;
