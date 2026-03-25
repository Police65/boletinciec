import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link, Svg, Path } from '@react-pdf/renderer';
import { Article, FinancialIndicator, DailyIndicator } from '../types';
import { getProxiedImageUrl } from '../services/newsService';
import { decodeHTMLEntities } from '../utils';
import '../utils/hyphenation';

const HEROLOGO_URL = "https://zurlbunvnwfkxmbzlfxt.supabase.co/storage/v1/object/public/images/LogotipoWHITE@1.5x.png";
const HEROCOVER_URL = "https://zurlbunvnwfkxmbzlfxt.supabase.co/storage/v1/object/public/images/edificio.jpeg";

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    heroContainer: {
        flexDirection: 'row',
        height: 600,
        width: '100%',
    },
    heroLeft: {
        width: '50%',
        backgroundColor: '#0a3264',
        padding: 40,
        color: '#ffffff',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    heroRight: {
        width: '50%',
        height: 600,
    },
    heroRightImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    logo: {
        height: 80,
        width: 220,
        objectFit: 'contain',
        marginBottom: 40,
    },
    titleWhite: {
        fontSize: 54,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        letterSpacing: 1,
        marginBottom: -5,
    },
    titleBlue: {
        fontSize: 54,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#4db8ff',
        letterSpacing: 1,
        marginBottom: 15,
    },
    dateLine: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    socialIconBlock: {
        marginRight: 15,
        backgroundColor: '#1e3a8a',
        padding: 8,
        borderRadius: 6,
    },
    socialIcon: {
        width: 26,
        height: 26,
    },
    indicatorsStrip: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        paddingVertical: 25,
        paddingHorizontal: 40,
        borderBottomWidth: 3,
        borderBottomColor: '#cbd5e1',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    indicatorItem: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 10,
    },
    indicatorLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#0ea5e9',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    indicatorValue: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#1e293b',
    },
    indicatorSub: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    bodyContainer: {
        padding: 40,
    },
    categorySection: {
        marginBottom: 50,
    },
    categoryTitleBase: {
        marginBottom: 25,
    },
    categoryTitleText: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#0a3264',
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 4,
        borderBottomColor: '#0ea5e9',
        paddingBottom: 4,
        alignSelf: 'center', // use flex-start if we want it aligned left tight, let's use flex-start to snap to text size
    },

    // Featured Article (Newspaper Lead Story)
    featuredCard: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 30,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    featuredImage: {
        width: '55%',
        height: 250,
        objectFit: 'cover',
        marginRight: 20,
        borderRadius: 2,
    },
    featuredContent: {
        width: '45%',
        flexDirection: 'column',
    },
    featuredTitleBox: {
        marginBottom: 10,
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        lineHeight: 1.1,
    },
    featuredSummary: {
        fontSize: 11,
        color: '#334155',
        textAlign: 'justify',
        lineHeight: 1.6,
        marginBottom: 20,
    },

    // Secondary Articles Grid Layout
    articlesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    articleCard: {
        width: '47%', // 2 columns
        marginBottom: 25,
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
    },
    articleImage: {
        width: '100%',
        height: 180,
        objectFit: 'cover',
        marginBottom: 15,
        borderRadius: 2,
    },
    articleTitleBox: {
        marginBottom: 10,
    },
    articleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        lineHeight: 1.3,
    },
    articleSummary: {
        fontSize: 11,
        color: '#475569',
        textAlign: 'justify',
        lineHeight: 1.5,
        marginBottom: 15,
    },
    readMoreLink: {
        fontSize: 10,
        color: '#0ea5e9',
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'none',
        marginTop: 'auto',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    footerContainer: {
        padding: 30,
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#ffffff',
    },
    disclaimerBox: {
        backgroundColor: '#0a3264',
        padding: 20,
        borderRadius: 6,
        width: '95%',
        alignItems: 'center',
    },
    disclaimerText: {
        color: '#cbd5e1',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 1.5,
        marginBottom: 8,
    },
    footerText: {
        color: '#ffffff',
        fontSize: 10,
        textAlign: 'center',
    }
});

interface NewsletterDocumentProps {
    articles: Article[];
    indicators: FinancialIndicator[];
    dailyIndicators: DailyIndicator[];
    dateRange: string;
    featuredArticles?: Record<string, string>;
}

const formatPrice = (price: number, id: string) => {
    if (id.toLowerCase().includes('bcv') || id.toLowerCase().includes('paralelo')) return `${price.toFixed(2)} Bs.`;
    return `$ ${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getIndicatorLabel = (id: string, name?: string) => {
    if (name) return name.toUpperCase();
    const map: Record<string, string> = {
        'bcv': 'USD BCV',
        'paralelo': 'USD BINANCE',
        'hierro': 'HIERRO (Tn)',
        'aluminio': 'ALUMINIO (Tn)',
        'oro': 'ORO (Oz)',
        'oil': 'PETRÓLEO'
    };
    return map[id.toLowerCase()] || id.toUpperCase().replace(/_/g, ' ');
};

const getIndicatorSubLabel = (id: string, type?: string) => {
    if (type?.toLowerCase() === 'currency' || type?.toLowerCase() === 'moneda') return 'Mercado Cambiario';
    if (type?.toLowerCase() === 'commodity') return 'Materia Prima';

    const map: Record<string, string> = {
        'bcv': 'Ref. Oficial',
        'paralelo': 'Promedio Mercado',
        'hierro': 'Ind. Siderúrgica',
        'aluminio': 'Ind. Transformación',
        'oro': 'Reserva Valor',
        'oil': 'Cesta Venezolana'
    };
    return map[id.toLowerCase()] || 'Indicador';
};

const NewsletterDocument: React.FC<NewsletterDocumentProps> = ({
    articles,
    indicators,
    dailyIndicators,
    dateRange,
    featuredArticles
}) => {
    const articlesByCategory = articles.reduce((acc, article) => {
        const categoryName = article.category?.name || 'Sin Categoría';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(article);
        return acc;
    }, {} as Record<string, Article[]>);

    const mergedIndicators = [
        ...dailyIndicators.map(di => ({
            id: di.name.toLowerCase(),
            name: di.name,
            price: di.value,
            type: di.type
        })),
        ...indicators.map(i => ({
            id: i.id.toLowerCase(),
            name: '',
            price: i.price,
            type: ''
        }))
    ];

    const uniqueIndicators = Array.from(new Map(mergedIndicators.map(item => [item.id, item])).values() as Iterable<any>).slice(0, 6);

    const calculateDynamicHeight = () => {
        let height = 600 + 80 + 170; // hero + body container padding + footer
        if (uniqueIndicators.length > 0) height += 105; // indicators strip

        Object.entries(articlesByCategory).forEach(([categoryName, categoryArticles]) => {
            const categoryContent = categoryArticles as Article[];
            if (categoryContent.length > 0) {
                height += 60; // category title and margins

                const featuredId = featuredArticles ? featuredArticles[categoryName] : undefined;
                let featuredArticle = categoryContent.find(a => a.id === featuredId);
                let remainingArticles = categoryContent.filter(a => a.id !== featuredId);

                if (!featuredArticle) {
                    featuredArticle = categoryContent[0];
                    remainingArticles = categoryContent.slice(1);
                }

                if (featuredArticle) {
                    const titleLines = Math.ceil((featuredArticle.title?.length || 80) / 40);
                    const sumLines = Math.ceil((featuredArticle.summary?.length || 300) / 80);
                    const textHeight = (titleLines * 28) + 10 + (sumLines * 18) + 40;
                    height += Math.max(250, textHeight) + 60; // image height vs text height, plus padding
                }

                if (remainingArticles && remainingArticles.length > 0) {
                    for (let i = 0; i < remainingArticles.length; i += 2) {
                        const calcCardHeight = (a: Article) => {
                            const tLines = Math.ceil((a.title?.length || 60) / 25);
                            const sLines = Math.ceil((a.summary?.length || 200) / 50);
                            return 180 + 15 + (tLines * 22) + 10 + (sLines * 17) + 15 + 15 + 50; 
                        };
                        const h1 = calcCardHeight(remainingArticles[i]);
                        const h2 = (i + 1 < remainingArticles.length) ? calcCardHeight(remainingArticles[i + 1]) : 0;
                        height += Math.max(h1, h2);
                    }
                }
                height += 50; // margin bottom for the category section
            }
        });

        height += 20; // safety bounding margin; the background color masks this seamlessly
        return Math.max(height, 792); 
    };

    const pageHeight = calculateDynamicHeight();

    return (
        <Document>
            <Page size={[612, pageHeight]} style={styles.page}>
                <View style={{ backgroundColor: '#ffffff' }}>
                    {/* Hero Section */}
                    <View style={styles.heroContainer}>
                        <View style={styles.heroLeft}>
                            <Image src={HEROLOGO_URL} style={styles.logo} />
                            <Text style={styles.titleWhite}>CIEC</Text>
                            <Text style={styles.titleBlue}>AL DÍA</Text>
                            <Text style={styles.dateLine}>{dateRange}</Text>
                            <View style={styles.socialContainer}>
                                <View style={styles.socialIconBlock}>
                                    <Link src="https://www.instagram.com/caraboboindustrial?igsh=MTc4emZhYXFlbW80Ng%3D%3D&utm_source=qr">
                                        <Svg viewBox="0 0 24 24" style={styles.socialIcon}>
                                            <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.98a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="#ffffff" />
                                        </Svg>
                                    </Link>
                                </View>
                                <View style={styles.socialIconBlock}>
                                    <Link src="https://www.facebook.com/share/1MTSfabXpE/?mibextid=wwXIfr">
                                        <Svg viewBox="0 0 24 24" style={styles.socialIcon}>
                                            <Path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z" fill="#ffffff" />
                                        </Svg>
                                    </Link>
                                </View>
                            </View>
                        </View>
                        <View style={styles.heroRight}>
                            <Image src={HEROCOVER_URL} style={styles.heroRightImage} />
                        </View>
                    </View>

                    {/* Financial Indicators Strip */}
                    {uniqueIndicators.length > 0 && (
                        <View style={styles.indicatorsStrip}>
                            {uniqueIndicators.map((ind, idx) => (
                                <View key={idx} style={styles.indicatorItem}>
                                    <Text style={styles.indicatorLabel}>{getIndicatorLabel(ind.id, ind.name)}</Text>
                                    <Text style={styles.indicatorValue}>{formatPrice(ind.price, ind.id)}</Text>
                                    <Text style={styles.indicatorSub}>{getIndicatorSubLabel(ind.id, ind.type)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Body Content */}
                    <View style={styles.bodyContainer}>
                        {Object.entries(articlesByCategory).map(([categoryName, categoryArticles]) => {
                            const featuredId = featuredArticles ? featuredArticles[categoryName] : undefined;
                            let featuredArticle = (categoryArticles as Article[]).find(a => a.id === featuredId);
                            let remainingArticles = (categoryArticles as Article[]).filter(a => a.id !== featuredId);

                            if (!featuredArticle && (categoryArticles as Article[]).length > 0) {
                                featuredArticle = (categoryArticles as Article[])[0];
                                remainingArticles = (categoryArticles as Article[]).slice(1);
                            }

                            return (
                                <View key={categoryName} style={styles.categorySection}>
                                    <View style={styles.categoryTitleBase}>
                                        <View style={{ alignSelf: 'flex-start' }}>
                                            <Text style={styles.categoryTitleText}>{categoryName}</Text>
                                        </View>
                                    </View>

                                    {/* Featured Lead Article */}
                                    {featuredArticle && (
                                        <View style={styles.featuredCard}>
                                            {featuredArticle.image_url && (
                                                <Image
                                                    src={getProxiedImageUrl(featuredArticle.image_url)}
                                                    style={styles.featuredImage}
                                                />
                                            )}
                                            <View style={styles.featuredContent}>
                                                <View style={styles.featuredTitleBox}>
                                                    <Link src={featuredArticle.source_url || '#'} style={{ textDecoration: 'none' }}>
                                                        <Text style={styles.featuredTitle}>
                                                            {decodeHTMLEntities(featuredArticle.title)}
                                                        </Text>
                                                    </Link>
                                                </View>
                                                <Text style={styles.featuredSummary}>
                                                    {decodeHTMLEntities(featuredArticle.summary)}
                                                </Text>
                                                <Link src={featuredArticle.source_url || '#'} style={styles.readMoreLink}>
                                                    LEER ARTÍCULO COMPLETO »
                                                </Link>
                                            </View>
                                        </View>
                                    )}

                                    {/* Secondary Articles Grid */}
                                    {remainingArticles.length > 0 && (
                                        <View style={styles.articlesGrid}>
                                            {remainingArticles.map((article) => (
                                                <View key={article.id} style={styles.articleCard}>
                                                    {article.image_url && (
                                                        <Image
                                                            src={getProxiedImageUrl(article.image_url)}
                                                            style={styles.articleImage}
                                                        />
                                                    )}
                                                    <View style={styles.articleTitleBox}>
                                                        <Link src={article.source_url || '#'} style={{ textDecoration: 'none' }}>
                                                            <Text style={styles.articleTitle}>
                                                                {decodeHTMLEntities(article.title)}
                                                            </Text>
                                                        </Link>
                                                    </View>
                                                    <Text style={styles.articleSummary}>{decodeHTMLEntities(article.summary)}</Text>

                                                    <Link src={article.source_url || '#'} style={styles.readMoreLink}>
                                                        LEER ARTÍCULO COMPLETO »
                                                    </Link>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <View style={styles.disclaimerBox}>
                        <Text style={styles.disclaimerText}>
                            El diferencial cambiario y los indicadores presentados son referenciales al momento de cierre de esta edición. Se sugiere a la industria consultar fuentes oficiales antes de la toma de decisiones críticas.
                        </Text>
                        <Text style={styles.footerText}>
                            Boletín generado automáticamente por CIEC App. © {new Date().getFullYear()} Cámara de Industriales del Estado Carabobo.
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default NewsletterDocument;
