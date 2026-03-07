export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  average_score: number | null;
  vote_count: number;
  user_vote: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Vote {
  id: number;
  topic_id: number;
  user_id: number;
  score: number;
  updated_at: string;
}

export interface UserStats {
  id: number;
  name: string;
  email: string;
  created_at: string;
  vote_count: number;
}

export interface GlobalStats {
  total_users: number;
  total_votes: number;
  latest_registration: string | null;
}
