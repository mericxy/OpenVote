import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao criar conta. Tente outro email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="p-3 bg-secondary/10 rounded-full text-secondary">
              <UserPlus size={32} />
            </div>
            <h2 className="text-2xl font-bold">Criar conta</h2>
            <p className="text-sm opacity-60">Junte-se à comunidade OpenVote</p>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2 mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Nome Completo</span>
              </label>
              <input 
                type="text" 
                placeholder="Seu nome" 
                className="input input-bordered w-full" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="ex@email.com" 
                className="input input-bordered w-full" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Senha (min. 6 caracteres)</span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full" 
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-secondary w-full mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
