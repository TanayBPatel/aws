import { GoogleGenAI } from "@google/genai";

// Ideally, this key should be fetched safely. Using process.env.API_KEY as per instructions.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getMarketInsight = async (symbol: string, currentPrice: number): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a very brief, 2-sentence market analysis for ${symbol} currently trading at ${currentPrice}. Focus on technical momentum suitable for a mobile app notification.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market analysis currently unavailable due to connectivity.";
  }
};

export const getPortfolioSummary = async (totalValue: number): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `My portfolio is valued at ₹${totalValue}. Give me a 1-sentence encouraging remark about wealth building.`,
        });
        return response.text;
    } catch (error) {
        return "Keep investing and stay consistent!";
    }
}