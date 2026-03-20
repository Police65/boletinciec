import { supabase } from './services/supabaseClient';

async function main() {
    console.log("Testing getApprovedArticlesByDateRange...");
    const res1 = await supabase
        .from('articles')
        .select('*, category:categories(id, name)')
        .eq('status', 'aprobado')
        .limit(1);
    if (res1.error) {
        console.error("articles error:", res1.error);
    } else {
        console.log("articles ok | Length:", res1.data.length);
    }

    console.log("Testing financial_indicators...");
    const res2 = await supabase
        .from('financial_indicators')
        .select('*')
        .limit(1);
    if (res2.error) {
        console.error("financial_indicators error:", res2.error);
    } else {
        console.log("financial_indicators ok | Length:", res2.data?.length);
    }

    console.log("Testing daily_indicators...");
    const res3 = await supabase
        .from('daily_indicators')
        .select('*')
        .limit(1);
    if (res3.error) {
        console.error("daily_indicators error:", res3.error);
    } else {
        console.log("daily_indicators ok | Length:", res3.data?.length);
    }
}

main().catch(console.error);
