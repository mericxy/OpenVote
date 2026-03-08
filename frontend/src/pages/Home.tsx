import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Topic } from '../types';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { Users, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { signed } = useAuth();

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signed) {
      fetchTopics();
    }
  }, [signed]);

  const handleVote = async (topicId: number, score: number) => {
    try {
      await api.post('/votes', { topic_id: topicId, score });
      fetchTopics(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  if (!signed) {
    return (
      <div className="hero min-h-[70vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">OpenVote</h1>
            <p className="py-6 text-lg">
              Dê sua opinião sobre os temas mais quentes e veja o que a comunidade pensa.
            </p>
            <div className="flex gap-2 justify-center">
              <a href="/login" className="btn btn-primary">Começar agora</a>
              <a href="/register" className="btn btn-outline">Criar conta</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Temas para Votação</h1>
          <p className="text-base-content opacity-60">Escolha um tema abaixo e dê seu voto de 1 a 5 estrelas.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <div key={topic.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title">{topic.title}</h2>
              <p className="text-sm opacity-70 line-clamp-3 mb-4">{topic.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-base-200">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">Média</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{topic.average_score || '0.0'}</span>
                    <StarRating rating={topic.average_score} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-50">
                  <Users size={14} />
                  <span>{topic.vote_count}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-base-200 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest block text-center opacity-60">
                  {topic.user_vote ? 'Seu voto atual' : 'Dê seu voto'}
                </span>
                <div className="flex justify-center">
                  <StarRating 
                    rating={topic.user_vote} 
                    interactive 
                    onRate={(score) => handleVote(topic.id, score)} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-lg opacity-50">Nenhum tema disponível para votação no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
