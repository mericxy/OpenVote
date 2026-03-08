import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifySensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import * as dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import jwtPlugin from './plugins/jwt.js';
import corsPlugin from './plugins/cors.js';
import authMiddleware from './middlewares/auth.js';

import { authRoutes } from './routes/auth.js';
import { topicsRoutes } from './routes/topics.js';
import { votesRoutes } from './routes/votes.js';
import { adminRoutes } from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySensible);
app.register(corsPlugin);
app.register(jwtPlugin);
app.register(authMiddleware);

// Configuração para servir o frontend em produção
if (process.env.NODE_ENV === 'production') {
  const isDist = __dirname.endsWith('dist');
  const frontendPath = isDist 
    ? path.resolve(__dirname, '../../frontend/dist')
    : path.resolve(__dirname, '../frontend/dist');

  app.register(fastifyStatic, {
    root: frontendPath,
  });

  // Fallback para SPA (React Router)
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/auth') || 
        request.url.startsWith('/topics') || 
        request.url.startsWith('/votes') || 
        request.url.startsWith('/admin')) {
      reply.code(404).send({ error: 'Not Found' });
      return;
    }
    reply.sendFile('index.html');
  });
}

// Rotas
app.register(authRoutes, { prefix: '/auth' });
app.register(topicsRoutes, { prefix: '/topics' });
app.register(votesRoutes, { prefix: '/votes' });
app.register(adminRoutes, { prefix: '/admin' });

const port = Number(process.env.PORT) || 3333;

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`HTTP Server running on http://localhost:${port}`);
});
