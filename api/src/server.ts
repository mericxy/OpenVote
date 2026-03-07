import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifySensible from '@fastify/sensible';
import * as dotenv from 'dotenv';

import jwtPlugin from './plugins/jwt.js';
import corsPlugin from './plugins/cors.js';
import authMiddleware from './middlewares/auth.js';

import { authRoutes } from './routes/auth.js';
import { topicsRoutes } from './routes/topics.js';
import { votesRoutes } from './routes/votes.js';
import { adminRoutes } from './routes/admin.js';

dotenv.config();

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySensible);
app.register(corsPlugin);
app.register(jwtPlugin);
app.register(authMiddleware);

// Rotas
app.register(authRoutes, { prefix: '/auth' });
app.register(topicsRoutes, { prefix: '/topics' });
app.register(votesRoutes, { prefix: '/votes' });
app.register(adminRoutes, { prefix: '/admin' });

const port = Number(process.env.PORT) || 3333;

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`HTTP Server running on http://localhost:${port}`);
});
