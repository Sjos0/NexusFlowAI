// genkit.config.ts
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-ai';

export default configureGenkit({
  plugins: [
    googleAI(), // O plugin lerá a chave GOOGLE_API_KEY do arquivo .env.local
  ],
  logSinks: [],
  enableTracing: true,
});
