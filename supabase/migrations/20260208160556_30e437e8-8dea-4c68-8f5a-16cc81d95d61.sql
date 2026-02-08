-- Enum para tipo de cliente
CREATE TYPE public.client_type AS ENUM ('pessoa_fisica', 'pessoa_juridica');

-- Tabela de Clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type client_type NOT NULL DEFAULT 'pessoa_fisica',
  name TEXT NOT NULL,
  document_number TEXT, -- CPF ou CNPJ
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'PR',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Casos (agrupa processos e atividades)
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_number TEXT, -- número interno
  status TEXT DEFAULT 'ativo',
  area TEXT, -- civil, penal, trabalhista, etc
  value DECIMAL(15,2),
  opened_at DATE DEFAULT CURRENT_DATE,
  closed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Processos (vinculado a casos)
CREATE TABLE public.processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  cnj TEXT NOT NULL,
  court TEXT,
  judge TEXT,
  subject TEXT,
  status TEXT DEFAULT 'Em andamento',
  distribution_date DATE,
  last_movement TEXT,
  last_movement_date TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Prazos
CREATE TABLE public.deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  deadline_time TIME,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'pendente', -- pendente, concluido, cancelado
  reminder_days INTEGER DEFAULT 3, -- dias antes para lembrar
  notified BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Modelos de Documentos
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- petição, contrato, procuração, etc
  description TEXT,
  content TEXT NOT NULL, -- template com variáveis {{variavel}}
  variables JSONB DEFAULT '[]'::jsonb, -- lista de variáveis disponíveis
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Clients Policies
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Cases Policies
CREATE POLICY "Users can view their own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cases" ON public.cases FOR DELETE USING (auth.uid() = user_id);

-- Processes Policies
CREATE POLICY "Users can view their own processes" ON public.processes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own processes" ON public.processes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own processes" ON public.processes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own processes" ON public.processes FOR DELETE USING (auth.uid() = user_id);

-- Deadlines Policies
CREATE POLICY "Users can view their own deadlines" ON public.deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deadlines" ON public.deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deadlines" ON public.deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deadlines" ON public.deadlines FOR DELETE USING (auth.uid() = user_id);

-- Document Templates Policies
CREATE POLICY "Users can view their own templates" ON public.document_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON public.document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.document_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.document_templates FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_processes_updated_at BEFORE UPDATE ON public.processes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON public.deadlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.document_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_clients_user ON public.clients(user_id);
CREATE INDEX idx_cases_user ON public.cases(user_id);
CREATE INDEX idx_cases_client ON public.cases(client_id);
CREATE INDEX idx_processes_user ON public.processes(user_id);
CREATE INDEX idx_processes_case ON public.processes(case_id);
CREATE INDEX idx_processes_cnj ON public.processes(cnj);
CREATE INDEX idx_deadlines_user ON public.deadlines(user_id);
CREATE INDEX idx_deadlines_date ON public.deadlines(user_id, deadline_date) WHERE status = 'pendente';
CREATE INDEX idx_templates_user ON public.document_templates(user_id);