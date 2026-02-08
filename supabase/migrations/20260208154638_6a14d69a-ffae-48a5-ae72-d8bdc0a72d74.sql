-- Add column to mark documents as knowledge base
ALTER TABLE public.documents 
ADD COLUMN is_knowledge_base BOOLEAN DEFAULT false,
ADD COLUMN content_text TEXT;

-- Create index for knowledge base queries
CREATE INDEX idx_documents_knowledge_base ON public.documents(user_id, is_knowledge_base) WHERE is_knowledge_base = true;