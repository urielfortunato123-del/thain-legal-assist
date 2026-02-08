import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Function to search knowledge base
async function searchKnowledgeBase(userId: string, query: string): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: docs, error } = await supabase
    .from("documents")
    .select("name, content_text")
    .eq("user_id", userId)
    .eq("is_knowledge_base", true)
    .not("content_text", "is", null);

  if (error || !docs || docs.length === 0) {
    return "";
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const relevantDocs = docs
    .map(doc => {
      const content = (doc.content_text || "").toLowerCase();
      const score = queryWords.reduce((acc, word) => {
        return acc + (content.includes(word) ? 1 : 0);
      }, 0);
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (relevantDocs.length === 0) {
    return "";
  }

  let context = "\n\n---\n📚 DOCUMENTOS DA BASE DE CONHECIMENTO:\n";
  for (const doc of relevantDocs) {
    const excerpt = (doc.content_text || "").slice(0, 3000);
    context += `\n[${doc.name}]:\n${excerpt}\n`;
  }
  context += "\n---\n";

  return context;
}

// Convert OpenAI-style messages to Gemini format
function convertToGeminiFormat(messages: ChatMessage[], systemPrompt: string) {
  const contents = [];
  let isFirstUser = true;
  
  for (const msg of messages) {
    if (msg.role === "system") continue;
    
    const role = msg.role === "assistant" ? "model" : "user";
    let content = msg.content;
    
    if (role === "user" && isFirstUser) {
      content = `[INSTRUÇÕES DO SISTEMA]\n${systemPrompt}\n[FIM DAS INSTRUÇÕES]\n\nUsuário: ${content}`;
      isFirstUser = false;
    }
    
    contents.push({
      role,
      parts: [{ text: content }]
    });
  }
  
  return contents;
}

// Call Gemini API
async function callGemini(geminiContents: any[], apiKey: string): Promise<Response> {
  const url = `${GEMINI_API_URL}?key=${apiKey}&alt=sse`;
  
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });
}

// Call OpenRouter with free model
async function callOpenRouter(messages: ChatMessage[], systemPrompt: string, apiKey: string): Promise<Response> {
  return await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://lovable.dev",
      "X-Title": "Thainá Jurídico",
    },
    body: JSON.stringify({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    }),
  });
}

// Transform Gemini SSE to OpenAI format
function createGeminiTransformStream() {
  return new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              const openAIFormat = {
                choices: [{ delta: { content } }]
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {
      throw new Error("No API keys configured (GEMINI_API_KEY or OPENROUTER_API_KEY)");
    }

    const { messages, mode, stream = true, userId } = await req.json() as {
      messages: ChatMessage[];
      mode: "PF" | "PJ";
      stream?: boolean;
      userId?: string;
    };

    // Search knowledge base if userId is provided
    let knowledgeContext = "";
    if (userId) {
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        knowledgeContext = await searchKnowledgeBase(userId, lastUserMessage.content);
      }
    }

    // System prompt
    const basePrompt = mode === "PJ"
      ? `Você é a assistente jurídica da Dra. Thainá Woichaka, especializada em direito empresarial (PJ).
Estilo: técnico, objetivo, foco em risco jurídico, compliance e estratégia.`
      : `Você é a assistente jurídica da Dra. Thainá Woichaka, especializada em direito civil e do consumidor (PF).
Estilo: claro, humano, explica termos jurídicos de forma simples.`;

    const knowledgeInstruction = knowledgeContext 
      ? `\n\n🔍 IMPORTANTE: Use os documentos da base de conhecimento abaixo como FONTE PRIMÁRIA para suas respostas. Cite o nome do documento quando usar informações dele.${knowledgeContext}`
      : "";

    const systemPrompt = `${basePrompt}

REGRAS OBRIGATÓRIAS:
1. SEMPRE cite a fonte oficial (Planalto, LexML, TJPR, CNJ) com link quando aplicável
2. Se não encontrar fonte confiável, diga explicitamente "não encontrei fonte oficial"
3. NUNCA invente artigos ou leis
4. Estrutura de resposta:
   a) Resumo ${mode === "PJ" ? "técnico" : "simples"} (até 8 linhas)
   b) Base legal: artigos/leis com links oficiais
   c) Riscos ${mode === "PJ" ? "e teses contrárias" : "do caso (sem alarmismo)"}
   d) Checklist prático de ${mode === "PJ" ? "compliance/documentos" : "documentos/provas"}
   ${mode === "PJ" ? "e) Observações estratégicas (prazo, custo, viabilidade)" : ""}
5. Finalize com: "A análise depende do caso concreto e da prova disponível."${knowledgeInstruction}`;

    const filteredMessages = messages.filter(m => m.role === "user" || m.role === "assistant");
    
    let response: Response | null = null;
    let useGemini = false;

    // Try Gemini first if available
    if (GEMINI_API_KEY) {
      const geminiContents = convertToGeminiFormat(filteredMessages, systemPrompt);
      response = await callGemini(geminiContents, GEMINI_API_KEY);
      
      if (response.ok) {
        useGemini = true;
      } else if (response.status === 429 && OPENROUTER_API_KEY) {
        console.warn("Gemini rate-limited (429). Falling back to OpenRouter.");
        response = null; // Will try OpenRouter
      }
    }

    // Fallback to OpenRouter
    if (!response && OPENROUTER_API_KEY) {
      response = await callOpenRouter(filteredMessages, systemPrompt, OPENROUTER_API_KEY);
    }

    if (!response) {
      throw new Error("No AI provider available");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Erro na API: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stream && response.body) {
      if (useGemini) {
        // Transform Gemini SSE to OpenAI format
        const transformedStream = response.body.pipeThrough(createGeminiTransformStream());
        return new Response(transformedStream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } else {
        // OpenRouter already uses OpenAI format
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
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
