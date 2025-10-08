import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getWeeklyApprovedArticles } from '../services/newsService';
import { generateWeeklySummary } from '../services/geminiService';
import type { Article } from '../types';
import Spinner from '../components/Spinner';
import ProxiedImage from '../components/ProxiedImage';
import { decodeHTMLEntities } from '../utils';
import { CIEC_LOGO_URL } from '../assets';

const NewsletterPage: React.FC = () => {
    const [weeklyArticles, setWeeklyArticles] = useState<Article[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadNewsletterData = async () => {
            try {
                setLoading(true);
                setError(null);
                const articles = await getWeeklyApprovedArticles();
                setWeeklyArticles(articles);

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

    const handleDownloadPdf = async () => {
        const content = pdfContentRef.current;
        if (!content) return;

        setGeneratingPdf(true);
        try {
            const canvas = await html2canvas(content, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
                hotfixes: ['px_scaling'],
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Calculate the total height of the canvas image when scaled to fit the PDF's width
            const totalImageHeightInPdf = (canvasHeight * pdfWidth) / canvasWidth;

            let heightLeft = totalImageHeightInPdf;
            let position = 0;

            // Add the first page (or the entire image if it fits)
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImageHeightInPdf);
            heightLeft -= pdfHeight;

            // Loop to add subsequent pages if the content is taller than one page
            while (heightLeft > 0) {
                position -= pdfHeight; // Move the "crop" position up by one page height
                pdf.addPage();
                // Add the same tall image, but the new `position` will cause jsPDF to render the next part of it
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImageHeightInPdf);
                heightLeft -= pdfHeight;
            }

            const date = new Date().toISOString().split('T')[0];
            pdf.save(`boletin-semanal-ciec-${date}.pdf`);

        } catch (err) {
            console.error("Error generating PDF:", err);
            setError("Ocurrió un error al generar el PDF. Por favor, intente de nuevo.");
        } finally {
            setGeneratingPdf(false);
        }
    };
    
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

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold font-newsreader">Boletín Semanal</h1>
                <button
                    onClick={handleDownloadPdf}
                    disabled={generatingPdf || loading || weeklyArticles.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {generatingPdf ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152a8,8,0,0,1,16,0v48H200V152a8,8,0,0,1,16,0ZM128,152a8,8,0,0,0,5.66-2.34l32-32a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32A8,8,0,0,0,128,152Z"></path>
                            </svg>
                            Descargar PDF
                        </>
                    )}
                </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
              <p className="font-bold">Función en fase de prueba</p>
              <p>El resumen ejecutivo de este boletín es generado por una IA en tiempo real. Debido a esto, el texto puede presentar variaciones en cada visita.</p>
            </div>

            {error && <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>}
            
            {loading ? <Spinner /> : (
                <>
                    {weeklyArticles.length === 0 ? (
                        <p className="text-center text-gray-500 bg-gray-50 p-8 rounded-lg">No hay noticias aprobadas en la última semana para generar el boletín.</p>
                    ) : (
                        <div ref={pdfContentRef} className="bg-white p-8 border rounded-lg shadow-sm">
                             {/* Header for PDF */}
                            <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
                                <div className="flex items-center gap-3 text-[#111418]">
                                    <ProxiedImage src={CIEC_LOGO_URL} alt="CIEC Logo" className="h-12 w-auto" />
                                    <h2 className="text-[#111418] text-2xl font-bold leading-tight tracking-[-0.015em] font-newsreader">CIEC Noticias</h2>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-lg font-newsreader">Boletín Semanal</h3>
                                    <p className="text-sm text-gray-600">{getWeekDateRange()}</p>
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
                                        <div className="space-y-6">
                                            {/* FIX: Cast `articles` to `Article[]` as TypeScript infers it as `unknown` from `Object.entries`. */}
                                            {(articles as Article[]).map(article => (
                                                <div key={article.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                                                    <div className="sm:w-1/4">
                                                        <ProxiedImage src={article.image_url} alt={decodeHTMLEntities(article.title)} className="w-full h-auto object-cover rounded-md aspect-video" />
                                                    </div>
                                                    <div className="sm:w-3/4">
                                                        <Link to={`/article/${article.id}`} target="_blank" className="hover:text-blue-600">
                                                            <h4 className="text-lg font-bold">{decodeHTMLEntities(article.title)}</h4>
                                                        </Link>
                                                        <p className="text-sm text-gray-600 mt-1">{decodeHTMLEntities(article.summary)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NewsletterPage;
