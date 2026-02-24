/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

export const AI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Nhanh, tiết kiệm', badge: 'Default' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Thông minh nhất', badge: 'Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Ổn định, dự phòng', badge: 'Stable' },
];

const MODEL_IDS = AI_MODELS.map(m => m.id);

export async function callGeminiAI(prompt: string, apiKey: string, modelName?: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Vui lòng cấu hình API Key trong phần Cài đặt!');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build fallback order: start with selected model, then try others
  const startIndex = MODEL_IDS.indexOf(modelName || MODEL_IDS[0]);
  const modelsToTry = [
    MODEL_IDS[startIndex >= 0 ? startIndex : 0],
    ...MODEL_IDS.filter((_, i) => i !== (startIndex >= 0 ? startIndex : 0)),
  ];

  let lastError: any = null;

  for (const modelId of modelsToTry) {
    try {
      console.log(`[AI] Trying model: ${modelId}`);
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      return response.text || '';
    } catch (error: any) {
      console.warn(`[AI] Model ${modelId} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // All models failed - throw raw error
  const rawMsg = lastError?.message || 'Không xác định';
  const statusMatch = rawMsg.match(/(\d{3})\s*(\w+)/);
  const errorDisplay = statusMatch ? `${statusMatch[0]} - ${rawMsg}` : rawMsg;
  throw new Error(errorDisplay);
}

export const generateInventorySuggestions = (products: any[], orders: any[]) => {
  const lowStock = products.filter(p => p.stock <= p.minStock);
  const slowMoving = products.filter(p => p.stock > 0 && !orders.some(o => o.items.some((i: any) => i.sku === p.sku)));
  
  let prompt = `Bạn là một chuyên gia tư vấn quản lý kho và bán hàng. Dựa trên dữ liệu sau, hãy đưa ra 3-5 gợi ý hành động cụ thể để tối ưu kinh doanh. Trả về định dạng Markdown ngắn gọn, súc tích.
  
  Dữ liệu tồn kho thấp: ${JSON.stringify(lowStock.map(p => ({ sku: p.sku, name: p.name, stock: p.stock, min: p.minStock })))}
  Dữ liệu hàng tồn lâu: ${JSON.stringify(slowMoving.map(p => ({ sku: p.sku, name: p.name, stock: p.stock })))}
  
  Yêu cầu gợi ý về:
  1. Nhập hàng cho các mã sắp hết.
  2. Xả tồn hoặc khuyến mãi cho hàng tồn lâu.
  3. Tối ưu biên lợi nhuận.`;

  return prompt;
};
