-- Create enum for Xbox tier
CREATE TYPE xbox_tier AS ENUM ('Sem', 'Essential', 'Premium', 'Ultimate');

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tier_xbox xbox_tier DEFAULT 'Sem',
  meta_mensal INTEGER DEFAULT 12000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  atividade TEXT,
  pc_busca INTEGER DEFAULT 0,
  mobile_busca INTEGER DEFAULT 0,
  quiz INTEGER DEFAULT 0,
  xbox INTEGER DEFAULT 0,
  total_pts INTEGER DEFAULT 0,
  meta_batida BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  reset_semanal BOOLEAN DEFAULT FALSE,
  notas TEXT,
  UNIQUE(user_id, data)
);

-- Create atividades table
CREATE TABLE atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  pts_esperados INTEGER DEFAULT 0,
  frequencia TEXT,
  categoria TEXT,
  notas TEXT
);

-- Create resgates table
CREATE TABLE resgates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  item TEXT NOT NULL,
  pts_usados INTEGER NOT NULL,
  valor_brl DECIMAL(10,2),
  custo_efetivo DECIMAL(10,2),
  notas TEXT
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates ENABLE ROW LEVEL SECURITY;

-- Create policies (basic, can be refined later)
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON daily_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON atividades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON atividades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON atividades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON atividades FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resgates" ON resgates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resgates" ON resgates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resgates" ON resgates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resgates" ON resgates FOR DELETE USING (auth.uid() = user_id);