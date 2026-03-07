import { FastifyReply, FastifyRequest } from 'fastify';
import { adminService } from '../services/admin.service.js';

export const adminController = {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    return adminService.getUserStats();
  },

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    return adminService.listUsers();
  }
};
