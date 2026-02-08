import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEGISLATIONS = [
  {
    name: "Constituição Federal de 1988",
    url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  },
  {
    name: "Código Civil - Lei 10.406/2002",
    url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",
  },
  {
    name: "Código Penal - Decreto-Lei 2.848/1940",
    url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm",
  },
  {
    name: "Código de Processo Civil - Lei 13.105/2015",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm",
  },
  {
    name: "Código de Processo Penal - Decreto-Lei 3.689/1941",
    url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm",
  },
  {
    name: "CLT - Decreto-Lei 5.452/1943",
    url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm",
  },
  {
    name: "Código de Defesa do Consumidor - Lei 8.078/1990",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
  },
];

async function fetchAndCleanText(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  
  // Remove HTML tags and clean up text
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    for (const leg of LEGISLATIONS) {
      try {
        console.log(`Fetching ${leg.name}...`);
        
        // Check if already exists
        const { data: existing } = await supabase
          .from("documents")
          .select("id")
          .eq("user_id", userId)
          .eq("name", leg.name)
          .eq("is_knowledge_base", true)
          .maybeSingle();

        if (existing) {
          results.push({ name: leg.name, status: "already_exists" });
          continue;
        }

        // Fetch content
        const content = await fetchAndCleanText(leg.url);
        
        // Limit content to 100k chars
        const limitedContent = content.slice(0, 100000);

        // Insert document
        const { data, error } = await supabase
          .from("documents")
          .insert({
            user_id: userId,
            name: leg.name,
            file_path: `planalto/${leg.name.replace(/\s+/g, "_").toLowerCase()}.txt`,
            file_type: "TXT",
            file_size: limitedContent.length,
            folder: "Banco de Dados",
            is_knowledge_base: true,
            content_text: limitedContent,
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting ${leg.name}:`, error);
          results.push({ name: leg.name, status: "error", error: error.message });
        } else {
          results.push({ name: leg.name, status: "success", chars: limitedContent.length });
        }
      } catch (err) {
        console.error(`Error processing ${leg.name}:`, err);
        results.push({ name: leg.name, status: "error", error: err instanceof Error ? err.message : "Unknown" });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
