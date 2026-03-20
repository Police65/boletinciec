import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Article, FinancialIndicator, DailyIndicator } from '../types';
import { getProxiedImageUrl } from '../services/newsService';
import { decodeHTMLEntities } from '../utils';

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
        marginBottom: 40,
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
        backgroundColor: '#0a3264',
        padding: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    disclaimerBox: {
        backgroundColor: '#1e3a8a',
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
        width: '80%',
    },
    disclaimerText: {
        color: '#94a3b8',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 1.4,
    },
    footerText: {
        color: '#ffffff',
        fontSize: 10,
        letterSpacing: 1,
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
                height += 320; // featured article height and margins

                const remaining = categoryContent.length - 1;
                if (remaining > 0) {
                    const rows = Math.ceil(remaining / 2);
                    height += rows * 390; // highly accurate matched height per row
                }
                height += 50; // margin bottom for the category section
            }
        });

        return Math.max(height, 792); // return at least standard letter height
    };

    const pageHeight = calculateDynamicHeight();

    return (
        <Document>
            <Page size={[612, pageHeight]} style={{ ...styles.page, backgroundColor: '#0a3264' }}>
                <View style={{ backgroundColor: '#ffffff' }}>
                    {/* Hero Section */}
                    <View style={styles.heroContainer}>
                        <View style={styles.heroLeft}>
                            <Image src={HEROLOGO_URL} style={styles.logo} />
                            <Text style={styles.titleWhite}>CIEC</Text>
                            <Text style={styles.titleBlue}>AL DÍA</Text>
                            <Text style={styles.dateLine}>{dateRange}</Text>
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
                            El diferencial cambiario y los indicadores presentados son referenciales al momento de cierre de esta edición.
                            Se sugiere a la industria consultar fuentes oficiales antes de la toma de decisiones críticas.
                        </Text>
                    </View>
                    <Text style={styles.footerText}>
                        Boletín generado automáticamente por CIEC App. © {new Date().getFullYear()} Cámara de Industriales del Estado Carabobo.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default NewsletterDocument;
