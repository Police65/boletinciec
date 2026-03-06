
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link, Font, Svg, Path } from '@react-pdf/renderer';
import { Article, FinancialIndicator, DailyIndicator } from '../types';
import { CIEC_LOGO_URL } from '../assets';
// We assume getProxiedImageUrl handles the proxy logic, but for react-pdf we often need base64 or a direct public URL.
// If the image is protected or needs cookies, it might fail. 
// Assuming standard public images or the proxy works for fetch.
import { getProxiedImageUrl } from '../services/newsService';
import { decodeHTMLEntities } from '../utils';

// Register a standard font if needed, otherwise use Helvetica/Times
// Font.register({ family: 'Noto Sans', src: '...' }); 

const styles = StyleSheet.create({
    bcvContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#eff6ff', // Light blue background
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#bfdbfe', // Softer blue border
    },
    bcvItem: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bcvLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#1e40af', // Darker blue for contrast
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    bcvValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    bcvUnit: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
        marginLeft: 3,
    },
    page: {
        padding: 30,
        backgroundColor: 'white',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333'
    },
    header: {
        marginBottom: 20,
        alignItems: 'center'
    },
    logo: {
        height: 60,
        marginBottom: 10,
        objectFit: 'contain'
    },
    title: {
        color: '#0a3264',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#555',
        marginBottom: 15, // Increased from 10
        textAlign: 'center'
    },
    editionBox: {
        borderTopWidth: 2,
        borderTopColor: '#0a3264',
        borderBottomWidth: 2,
        borderBottomColor: '#0a3264',
        paddingVertical: 5,
        width: '80%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold'
    },
    indicatorsContainer: {
        backgroundColor: '#0a3264',
        padding: 10,
        marginBottom: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        color: 'white'
    },
    indicatorItem: {
        alignItems: 'center',
        minWidth: 80,
        marginBottom: 5
    },
    indicatorLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 2
    },
    indicatorValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 1
    },
    indicatorSubItem: {
        fontSize: 7,
        color: 'rgba(255,255,255,0.8)'
    },
    summaryContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        borderLeftWidth: 5,
        borderLeftColor: '#285aa0',
        padding: 15,
        marginBottom: 20
    },
    summaryTitle: {
        color: '#285aa0',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    summaryText: {
        fontSize: 10,
        textAlign: 'justify',
        lineHeight: 1.5
    },
    sectionTitle: {
        color: '#0a3264',
        fontSize: 14,
        borderBottomWidth: 2,
        borderBottomColor: '#285aa0',
        paddingBottom: 3,
        marginBottom: 10,
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    articlesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    articleCard: {
        width: '48%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#285aa0',
        borderRadius: 4,
        marginBottom: 15,
        overflow: 'hidden'
    },
    articleTitleBox: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f8ff',
        padding: 8
    },
    articleTitle: {
        color: '#0a3264',
        fontSize: 11,
        fontWeight: 'bold'
    },
    articleContent: {
        padding: 8
    },
    articleImage: {
        width: '100%',
        height: 100,
        objectFit: 'cover',
        marginBottom: 8,
        borderRadius: 2
    },
    articleSummary: {
        fontSize: 9,
        textAlign: 'justify',
        color: '#333',
        lineHeight: 1.3
    },
    articleSourceContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5
    },
    sourceIcon: {
        width: 10,
        height: 10,
        marginRight: 4
    },
    sourceLink: {
        fontSize: 10,
        color: '#285aa0', // blue
        textDecoration: 'underline'
    },
    footer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    },
    disclaimerBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 3,
        padding: 10,
        backgroundColor: '#fafafa',
        marginBottom: 5
    },
    disclaimerTitle: {
        color: '#0a3264',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3
    },
    disclaimerText: {
        fontSize: 8,
        color: '#666',
        fontStyle: 'italic'
    },
    copyright: {
        textAlign: 'center',
        fontSize: 8,
        color: '#888',
        marginTop: 5
    }
});

interface NewsletterDocumentProps {
    articles: Article[];
    summary: string;
    indicators: FinancialIndicator[];
    dailyIndicators: DailyIndicator[];
    dateRange: string;
    editionNumber?: number;
}

// Helpers
const formatPrice = (price: number, id: string) => {
    if (id.toLowerCase().includes('bcv') || id.toLowerCase().includes('paralelo')) return `${price.toFixed(2)} Bs.`;
    return `$ ${price.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `;
};

const getIndicatorLabel = (id: string) => {
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

const getIndicatorSubLabel = (id: string) => {
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

// Render bold text helper
const ParsedText = ({ text, style }: { text: string, style?: any }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <Text style={style}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <Text key={index} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
                }
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
};

const NewsletterDocument: React.FC<NewsletterDocumentProps> = ({
    articles,
    summary,
    indicators,
    dailyIndicators,
    dateRange,
    editionNumber = 452
}) => {
    // Group articles
    const articlesByCategory = articles.reduce((acc, article) => {
        const categoryName = article.category?.name || 'Sin Categoría';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(article);
        return acc;
    }, {} as Record<string, Article[]>);

    const bcvDolar = dailyIndicators.find(i =>
        (i.type?.toLowerCase() === 'currency' || i.type?.toLowerCase() === 'moneda') &&
        i.name?.toLowerCase().includes('dolar') && i.name?.toLowerCase().includes('bcv')
    ) || indicators.find(i => i.id?.toLowerCase().includes('dolar') && i.id?.toLowerCase().includes('bcv'));

    const bcvEuro = dailyIndicators.find(i =>
        (i.type?.toLowerCase() === 'currency' || i.type?.toLowerCase() === 'moneda') &&
        i.name?.toLowerCase().includes('euro') && i.name?.toLowerCase().includes('bcv')
    ) || indicators.find(i => i.id?.toLowerCase().includes('euro') && i.id?.toLowerCase().includes('bcv'));

    const getPriceValue = (ind: any) => {
        if (!ind) return '0.00';
        const val = ind.value !== undefined ? ind.value : ind.price;
        return typeof val === 'string' ? parseFloat(val).toFixed(2) : val.toFixed(2);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                {/* Header */}
                <View style={styles.header} fixed>
                    <Image src={CIEC_LOGO_URL} style={styles.logo} />
                    <Text style={styles.title}>CIEC AL DÍA</Text>
                    <Text style={styles.subtitle}>Informe Semanal de Coyuntura Económica e Industrial</Text>
                    <View style={styles.editionBox}>
                        <Text>{dateRange} | Edición Nro. {editionNumber}</Text>
                    </View>
                </View>

                {/* BCV Tasa Oficial (Light blue container) */}
                {(bcvDolar || bcvEuro) && (
                    <View style={styles.bcvContainer} wrap={false}>
                        {bcvDolar && (
                            <View style={[styles.bcvItem, { borderRightWidth: bcvEuro ? 1 : 0, borderRightColor: '#bfdbfe' }]}>
                                <Text style={styles.bcvLabel}>Dólar BCV</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={styles.bcvValue}>
                                        {getPriceValue(bcvDolar)}
                                    </Text>
                                    <Text style={styles.bcvUnit}>Bs.S</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#3b82f6', marginTop: 4, fontWeight: 'bold' }}>
                                    Ref. Oficial
                                </Text>
                            </View>
                        )}
                        {bcvEuro && (
                            <View style={[styles.bcvItem, { paddingLeft: bcvDolar ? 20 : 0 }]}>
                                <Text style={styles.bcvLabel}>Euro BCV</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={styles.bcvValue}>
                                        {getPriceValue(bcvEuro)}
                                    </Text>
                                    <Text style={styles.bcvUnit}>Bs.S</Text>
                                </View>
                                <Text style={{ fontSize: 7, color: '#3b82f6', marginTop: 4, fontWeight: 'bold' }}>
                                    Ref. Oficial
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Indicators */}
                {indicators.length > 0 && (
                    <View style={styles.indicatorsContainer} wrap={false}>
                        {indicators.map((ind) => (
                            <View key={ind.id} style={styles.indicatorItem}>
                                <Text style={styles.indicatorLabel}>{getIndicatorLabel(ind.id)}</Text>
                                <Text style={styles.indicatorValue}>{formatPrice(ind.price, ind.id)}</Text>
                                <Text style={styles.indicatorSubItem}>{getIndicatorSubLabel(ind.id)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Summary */}
                {summary && (
                    <View style={styles.summaryContainer} wrap={false}>
                        <Text style={styles.summaryTitle}>Resumen Ejecutivo</Text>
                        <ParsedText text={summary} style={styles.summaryText} />
                    </View>
                )}

                {/* Articles */}
                {Object.entries(articlesByCategory).map(([categoryName, categoryArticles]) => (
                    <View key={categoryName}>
                        {/* wrap={false} here prevents the Title + Grid chunk from splitting weirdly if possible, 
                            but for large categories we might WANT the grid to split, just not individual cards. 
                            So maybe remove wrap={false} from section container, only on cards. 
                        */}
                        <Text style={styles.sectionTitle}>{categoryName}</Text>

                        <View style={styles.articlesGrid}>
                            {(categoryArticles as Article[]).map((article) => {
                                const domain = article.source_url ? new URL(article.source_url).hostname.replace('www.', '') : 'CIEC';
                                return (
                                    <View key={article.id} style={styles.articleCard} wrap={false}>
                                        <View style={styles.articleTitleBox}>
                                            <Text style={styles.articleTitle}>
                                                {decodeHTMLEntities(article.title)}
                                            </Text>
                                        </View>
                                        <View style={styles.articleContent}>
                                            {article.image_url && (
                                                <Image
                                                    src={getProxiedImageUrl(article.image_url)}
                                                    style={styles.articleImage}
                                                />
                                            )}
                                            <Text style={styles.articleSummary}>{decodeHTMLEntities(article.summary)}</Text>

                                            <View style={styles.articleSourceContainer}>
                                                <Text style={{ fontSize: 10, marginRight: 4, fontStyle: 'italic', color: '#666' }}>Fuente:</Text>
                                                {/* Simple link icon */}
                                                <Svg style={styles.sourceIcon} viewBox="0 0 24 24">
                                                    <Path
                                                        d="M18 13 v6 h-12 v-12 h6 M15 3 h6 v6 M10 14 L21 3"
                                                        stroke="#285aa0"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </Svg>
                                                <Link src={article.source_url || '#'} style={styles.sourceLink}>
                                                    {domain}
                                                </Link>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {/* Footer - render at bottom of last page or flow naturally */}
                <View style={styles.footer} wrap={false}>
                    <View style={styles.disclaimerBox}>
                        <Text style={styles.disclaimerTitle}>Nota de Cierre</Text>
                        <Text style={styles.disclaimerText}>
                            El diferencial cambiario y los indicadores presentados son referenciales al momento de cierre de esta edición.
                            Se sugiere a la industria consultar fuentes oficiales antes de la toma de decisiones críticas.
                        </Text>
                    </View>
                    <Text style={styles.copyright}>
                        Boletín generado automáticamente por CIEC App. © {new Date().getFullYear()} Cámara de Industriales.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default NewsletterDocument;
