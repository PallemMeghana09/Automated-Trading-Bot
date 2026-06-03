/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for body parsing
app.use(express.json());

// Initialize Gemini API client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI Client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini Client:', error);
  }
} else {
  console.warn('GEMINI_API_KEY not set. Serving fallback responses for AI features.');
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health & Configuration status Check
app.get('/api/config', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!ai,
    serverTime: new Date().toISOString(),
  });
});

// 1b. Real-time Market Quote from Yahoo Finance
app.get('/api/market/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    let querySymbol = symbol.toUpperCase();
    if (querySymbol === 'EUR-USD') {
      querySymbol = 'EURUSD=X';
    } else if (querySymbol === 'GBP-USD') {
      querySymbol = 'GBPUSD=X';
    } else if (querySymbol === 'JPY-USD') {
      querySymbol = 'JPYUSD=X';
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?interval=1d&range=3mo`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance responded with status ${response.status}`);
    }

    const data: any = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No charts found for symbol ' + symbol });
    }

    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    // Construct historical OHLCV chart array
    const history: any[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined && opens[i] !== null && opens[i] !== undefined) {
        const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        history.push({
          date: dateStr,
          open: Number(opens[i].toFixed(2)),
          high: Number((highs[i] ?? closes[i]).toFixed(2)),
          low: Number((lows[i] ?? closes[i]).toFixed(2)),
          close: Number(closes[i].toFixed(2)),
          volume: Number(volumes[i] ?? 0),
        });
      }
    }

    const currentPrice = meta.regularMarketPrice ?? (closes[closes.length - 1] || 150);
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? (closes[closes.length - 2] || currentPrice);
    const change = Number((currentPrice - prevClose).toFixed(2));
    const changePercent = Number(((change / prevClose) * 100).toFixed(2));

    const isCrypto = symbol.toUpperCase().includes('BTC') || symbol.toUpperCase().includes('ETH') || symbol.toUpperCase().includes('-');
    const isForex = symbol.toUpperCase().includes('-') && (symbol.toUpperCase().includes('USD') || symbol.toUpperCase().includes('EUR'));
    const guessName = isCrypto
      ? `${symbol.toUpperCase()} Digital Asset`
      : isForex
      ? `${symbol.toUpperCase()} Currency Pair`
      : `${symbol.toUpperCase()} Equity`;

    // Try to get standard names
    let finalName = guessName;
    if (symbol.toUpperCase() === 'AAPL') finalName = 'Apple Inc.';
    else if (symbol.toUpperCase() === 'NVDA') finalName = 'NVIDIA Corporation';
    else if (symbol.toUpperCase() === 'TSLA') finalName = 'Tesla, Inc.';
    else if (symbol.toUpperCase() === 'MSFT') finalName = 'Microsoft Corporation';
    else if (symbol.toUpperCase() === 'AMZN') finalName = 'Amazon.com, Inc.';
    else if (symbol.toUpperCase() === 'BTC-USD') finalName = 'Bitcoin (USD)';
    else if (symbol.toUpperCase() === 'EUR-USD') finalName = 'Euro / US Dollar';

    res.json({
      symbol: symbol.toUpperCase(),
      name: finalName,
      price: currentPrice,
      open: prevClose,
      high: Math.max(...(closes.slice(-10).filter((x: any) => x !== null) as number[]), currentPrice),
      low: Math.min(...(closes.slice(-10).filter((x: any) => x !== null) as number[]), currentPrice),
      close: currentPrice,
      volume: volumes[volumes.length - 1] || 1000000,
      change,
      changePercent,
      sector: isCrypto ? 'Cryptocurrency' : isForex ? 'Forex' : 'Technology',
      marketCap: isCrypto ? 'N/A' : isForex ? 'N/A' : (meta.marketCap ? (meta.marketCap / 1e12).toFixed(2) + 'T' : 'TBD'),
      history
    });
  } catch (error: any) {
    console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 2. AI Chat assistant
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Fallback if Gemini key is missing
  if (!ai) {
    return res.json({
      text: `[Demo Mode Enabled] I'm your Trading Bot Chat Assistant. I see your query: "${message}". Please configure your actual Google Gemini API Key in Settings > Secrets to activate real AI intellect! Currently, I recommend monitoring RSI (38.5 oversold) on AAPL for potential reverse breakouts. Always deploy stop-loss targets of 1.5% to manage trade risks.`,
    });
  }

  try {
    // Standard system instructions for quantitative traders
    const systemInstruction = 
      "You are the Automated Trading Bot Pro AI Terminal Assistant. " +
      "Provide professional, highly accurate quantitative analysis, technical indicator analysis " +
      "(RSI, MACD, Moving Averages, Bollinger Bands, ATR), risk management advice, " +
      "portfolio diversification metrics, and algorithmic trading recommendations. " +
      "Always clarify that your advice covers paper trading environments, highlight stop-loss targets, " +
      "and specify the critical risk disclosures. Keep answers concise, highly structured in Markdown, " +
      "and focused on actionable financial wisdom.";

    // Convert client-side chat format to contents parameter
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || 'Could not fetch response text' });
  } catch (error: any) {
    console.error('Chat generation error:', error);
    res.status(500).json({ error: 'AI generation error', details: error.message });
  }
});

// 3. AI News Sentiment Analyser
app.post('/api/gemini/sentiment', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  if (!ai) {
    // Generate simulated fallback response based on input search keywords
    const isNegative = text.toLowerCase().includes('sec') || text.toLowerCase().includes('investigates') || text.toLowerCase().includes('drop');
    return res.json({
      sentiment: isNegative ? 'BEARISH' : 'BULLISH',
      score: isNegative ? -0.68 : 0.76,
      percentage: isNegative ? 68 : 76,
      explanation: '[Demo Mode] The local analyzer parsed words: ' + (isNegative ? 'Regulators investigating leveraged assets is exerting major downward pressure.' : 'Steady earnings report and positive tech integration signal a continued upward structure.'),
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze the sentiment of the following financial/news headlines and articles. Respond in JSON.
      Text to analyze:
      """
      ${text}
      """`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['sentiment', 'score', 'percentage', 'explanation'],
          properties: {
            sentiment: {
              type: Type.STRING,
              description: 'The overall sentiment, must be exactly one of: BULLISH, BEARISH, or NEUTRAL',
            },
            score: {
              type: Type.NUMBER,
              description: 'Numerical score where -1.0 is highly bearish and +1.0 is highly bullish',
            },
            percentage: {
              type: Type.INTEGER,
              description: 'Percentage level of absolute sentiment weight (e.g. 85 for 85%)',
            },
            explanation: {
              type: Type.STRING,
              description: 'Comprehensive financial breakdown summarizing key news catalysts and risk vectors',
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Sentiment analyst error:', error);
    res.status(500).json({ error: 'AI Sentiment analyst error', details: error.message });
  }
});

// 4. AI Price Trend & Forecast Predictor
app.post('/api/gemini/forecast', async (req, res) => {
  const { symbol, prices } = req.body;
  if (!symbol || !prices || !Array.isArray(prices)) {
    return res.status(400).json({ error: 'Symbol and prices array are required' });
  }

  if (!ai) {
    // Simulated prediction fallback
    const currentPrice = prices[prices.length - 1] || 150;
    const direction = Math.random() > 0.4 ? 'UP' : 'DOWN';
    const drift = currentPrice * (direction === 'UP' ? 0.042 : -0.038);
    const predictedPrice = Number((currentPrice + drift).toFixed(2));
    return res.json({
      symbol,
      direction,
      predictedPrice,
      confidence: 82,
      weeklyTrend: direction === 'UP' ? 'BULLISH' : 'BEARISH',
      monthlyTrend: 'BULLISH',
      recommendation: `[Demo Mode] High probability pullback near immediate resistance. Recommend entry limits near $${(currentPrice * 0.992).toFixed(2)} with stop objectives at $${(currentPrice * 0.97).toFixed(2)}.`,
    });
  }

  try {
    const priceContext = prices.slice(-15).join(', '); // past 15 points
    const promptMessage = 
      `Analyze the horizontal path and momentum of stock ${symbol} based on these recent sequential close prices: [${priceContext}]. ` +
      `Generate a short-term price forecast and output in JSON format corresponding to the required schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptMessage,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['symbol', 'direction', 'predictedPrice', 'confidence', 'weeklyTrend', 'monthlyTrend', 'recommendation'],
          properties: {
            symbol: { type: Type.STRING },
            direction: {
              type: Type.STRING,
              description: 'Must buy/sell directional forecast: UP or DOWN',
            },
            predictedPrice: {
              type: Type.NUMBER,
              description: 'The anticipated end-of-week target price',
            },
            confidence: {
              type: Type.INTEGER,
              description: 'Statistical probability confidence percentage from 0 to 100',
            },
            weeklyTrend: {
              type: Type.STRING,
              description: 'One of: BULLISH, BEARISH, NEUTRAL',
            },
            monthlyTrend: {
              type: Type.STRING,
              description: 'One of: BULLISH, BEARISH, NEUTRAL',
            },
            recommendation: {
              type: Type.STRING,
              description: 'Actionable trading limit instructions, exact entry points, trailing stops, and risk sizing guidelines',
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Forecast predictor error:', error);
    res.status(500).json({ error: 'AI Forecast predictor error', details: error.message });
  }
});

// ==========================================
// VITE OR STATIC FRONTEND WORKFLOWS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounting Vite dev environment middleware');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build folder:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Automated Trading Bot server is live and running on: http://localhost:${PORT}`);
  });
}

startServer();
