import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { GlobalStats, UserStats, Topic } from '../types';
import { Users, Vote, Plus, Trash2, BarChart3, Loader2 } from 'lucide-react';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Topic creation state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, topicsRes] = await Promise.all([
        api.get('/admin/users/stats'),
        api.get('/admin/users'),
        api.get('/topics')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/topics', { title: newTitle, description: newDesc });
      setNewTitle('');
      setNewDesc('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este tema e todos os seus votos?')) return;
    try {
      await api.delete(`/topics/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Dashboard do Administrador</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Users size={32} />
            </div>
            <div className="stat-title">Total de Usuários</div>
            <div className="stat-value text-primary">{stats?.total_users}</div>
            <div className="stat-desc">Último: {stats?.latest_registration ? new Date(stats.latest_registration).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Vote size={32} />
            </div>
            <div className="stat-title">Total de Votos</div>
            <div className="stat-value text-secondary">{stats?.total_votes}</div>
            <div className="stat-desc">Média de {(stats?.total_votes || 0) / (stats?.total_users || 1)} por user</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat">
            <div className="stat-figure text-accent">
              <BarChart3 size={32} />
            </div>
            <div className="stat-title">Temas Ativos</div>
            <div className="stat-value text-accent">{topics.length}</div>
            <div className="stat-desc">Temas disponíveis</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Topic */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title mb-4"><Plus className="text-success" /> Novo Tema</h2>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Título</span></label>
                <input 
                  className="input input-bordered" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Descrição</span></label>
                <textarea 
                  className="textarea textarea-bordered h-24" 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)}
                  required
                ></textarea>
              </div>
              <button className="btn btn-success text-white" disabled={creating}>
                {creating ? <Loader2 className="animate-spin" /> : 'Criar Tema'}
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
          <div className="card-body p-0">
            <div className="p-6 pb-2">
              <h2 className="card-title"><Users className="text-info" /> Usuários Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Votos</th>
                    <th>Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-bold">{u.name}</div>
                        <div className="text-xs opacity-50">{u.email}</div>
                      </td>
                      <td>{u.vote_count}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Management */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <h2 className="card-title mb-4">Gerenciar Temas</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Média</th>
                  <th>Votos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td><div className="font-bold">{t.title}</div></td>
                    <td><div className="badge badge-ghost font-bold">{t.average_score || '0.0'}</div></td>
                    <td>{t.vote_count}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteTopic(t.id)}
                        className="btn btn-ghost btn-xs text-error gap-1"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
