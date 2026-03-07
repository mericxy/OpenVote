import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { authService } from '../services/auth.service.js';

export const authController = {
  async register(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const { name, email, password } = request.body;
    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await authService.register({ name, email, password_hash });
    
    const { password_hash: _, ...userWithoutPassword } = user;
    return reply.status(201).send(userWithoutPassword);
  },

  async login(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const { email, password } = request.body;
    const user = await authService.login({ email, password_plain: password });
    
    const token = await reply.jwtSign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    return { token };
  },
};
