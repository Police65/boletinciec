import { GoogleGenAI } from "@google/genai";
import type { Article } from '../types';
import { GEMINI_API_KEY } from '../config';

// This should be handled in a secure backend in a real production app.
// For this project, we are initializing it on the client side as requested.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


export const generateWeeklySummary = async (articles: Article[]): Promise<string> => {
    if (articles.length === 0) {
        return "No hay noticias esta semana para generar un resumen.";
    }

    const articlesInfo = articles.map(a => `- ${a.title}: ${a.summary}`).join('\n');

    const prompt = `
    Eres un analista experto para la Cámara de Industriales del Estado Carabobo (CIEC) en Venezuela.
    Tu tarea es redactar un resumen ejecutivo conciso y profesional para el boletín informativo semanal.
    A continuación se presenta una lista de los titulares y resúmenes de las noticias más importantes de esta semana:

    ${articlesInfo}

    Basado en esta información, elabora un párrafo de resumen ejecutivo que capture las tendencias y los puntos clave más relevantes para los industriales y empresarios. El tono debe ser formal, directo y enfocado en el impacto económico y empresarial. No enumeres las noticias, sino que debes sintetizar la información en una narrativa coherente. No incluyas un título redundante como "**Resumen Ejecutivo Semanal**" al inicio, ya que la sección ya tiene un título. Para enfatizar texto, usa asteriscos dobles para negrita (ejemplo: **texto importante**).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating weekly summary with Gemini:", error);
        throw new Error("Failed to generate weekly summary.");
    }
};
