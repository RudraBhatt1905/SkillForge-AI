import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { prompt, systemInstruction, jsonSchema } = JSON.parse(body);
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not set.' }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const config: any = {};
            if (systemInstruction) {
              config.systemInstruction = systemInstruction;
            }
            if (jsonSchema) {
              config.responseMimeType = 'application/json';
              config.responseSchema = jsonSchema;
            }

            // Candidate models with fallback order
            const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
            let lastError: any = null;
            let response: any = null;

            for (const model of candidateModels) {
              // Try up to 2 attempts with backoff if experiencing high demand (503 / 429)
              for (let attempt = 0; attempt < 2; attempt++) {
                try {
                  response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config,
                  });
                  if (response && response.text !== undefined) {
                    break;
                  }
                } catch (err: any) {
                  lastError = err;
                  const isLoadError =
                    err?.status === 'UNAVAILABLE' ||
                    err?.code === 503 ||
                    err?.message?.includes('503') ||
                    err?.message?.includes('high demand') ||
                    err?.message?.includes('RESOURCE_EXHAUSTED') ||
                    err?.code === 429;

                  if (isLoadError && attempt < 1) {
                    await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
                    continue;
                  }
                  if (isLoadError) {
                    console.warn(`Model ${model} unavailable due to demand, trying fallback...`);
                    break;
                  }
                  throw err;
                }
              }
              if (response && response.text !== undefined) {
                break;
              }
            }

            if (!response && lastError) {
              throw lastError;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: response?.text || '' }));
          } catch (error: any) {
            console.error('Gemini API endpoint error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Error processing Gemini request' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
