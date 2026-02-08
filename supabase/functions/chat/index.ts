import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning_details?: unknown;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const { messages, mode, stream = true } = await req.json() as {
      messages: ChatMessage[];
      mode: "PF" | "PJ";
      stream?: boolean;
    };

    // System prompt for legal assistant
    const systemPrompt = mode === "PJ"
      ? `Você é a assistente jurídica Thainá, especializada em direito empresarial (PJ).
Estilo: técnico, objetivo, foco em risco jurídico, compliance e estratégia.

REGRAS OBRIGATÓRIAS:
1. SEMPRE cite a fonte oficial (Planalto, LexML, TJPR, CNJ) com link quando aplicável
2. Se não encontrar fonte confiável, diga explicitamente "não encontrei fonte oficial"
3. NUNCA invente artigos ou leis
4. Estrutura de resposta:
   a) Resumo técnico (até 8 linhas)
   b) Base legal: artigos/leis com links oficiais
   c) Riscos e teses contrárias
   d) Checklist prático de compliance/documentos
   e) Observações estratégicas (prazo, custo, viabilidade)
5. Finalize com: "A análise depende do caso concreto e da prova disponível."`
      : `Você é a assistente jurídica Thainá, especializada em direito civil e do consumidor (PF).
Estilo: claro, humano, explica termos jurídicos de forma simples.

REGRAS OBRIGATÓRIAS:
1. SEMPRE cite a fonte oficial (Planalto, LexML, TJPR, CNJ) com link quando aplicável
2. Se não encontrar fonte confiável, diga explicitamente "não encontrei fonte oficial"
3. NUNCA invente artigos ou leis
4. Estrutura de resposta:
   a) Resumo simples (até 8 linhas)
   b) Base legal: artigos/leis com links oficiais
   c) Riscos do caso (sem alarmismo)
   d) Checklist prático de documentos/provas
5. Finalize com: "A análise depende do caso concreto e da prova disponível."`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Thainá Jurídico",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: fullMessages,
        stream,
        reasoning: { enabled: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
