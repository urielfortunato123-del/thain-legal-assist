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
  {
    name: "ECA - Estatuto da Criança e do Adolescente - Lei 8.069/1990",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
  },
  {
    name: "Lei Maria da Penha - Lei 11.340/2006",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",
  },
  {
    name: "Estatuto do Idoso - Lei 10.741/2003",
    url: "https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm",
  },
  {
    name: "Lei de Execução Penal - Lei 7.210/1984",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l7210.htm",
  },
  {
    name: "Lei de Drogas - Lei 11.343/2006",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm",
  },
  {
    name: "Lei de Licitações - Lei 14.133/2021",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm",
  },
];

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
  };

  for (let i = 0; i < retries; i++) {
    try {
      // Add delay between retries
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 * i));
      }
      const response = await fetch(url, { headers });
      if (response.ok) return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed for ${url}`);
      if (i === retries - 1) throw error;
    }
  }
  throw new Error(`Failed after ${retries} retries`);
}

// Decode HTML entities properly (including numeric entities for Portuguese chars)
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&quot;": '"',
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&aacute;": "á", "&Aacute;": "Á",
    "&agrave;": "à", "&Agrave;": "À",
    "&atilde;": "ã", "&Atilde;": "Ã",
    "&acirc;": "â", "&Acirc;": "Â",
    "&eacute;": "é", "&Eacute;": "É",
    "&egrave;": "è", "&Egrave;": "È",
    "&ecirc;": "ê", "&Ecirc;": "Ê",
    "&iacute;": "í", "&Iacute;": "Í",
    "&igrave;": "ì", "&Igrave;": "Ì",
    "&oacute;": "ó", "&Oacute;": "Ó",
    "&ograve;": "ò", "&Ograve;": "Ò",
    "&otilde;": "õ", "&Otilde;": "Õ",
    "&ocirc;": "ô", "&Ocirc;": "Ô",
    "&uacute;": "ú", "&Uacute;": "Ú",
    "&ugrave;": "ù", "&Ugrave;": "Ù",
    "&ucirc;": "û", "&Ucirc;": "Û",
    "&ccedil;": "ç", "&Ccedil;": "Ç",
    "&ntilde;": "ñ", "&Ntilde;": "Ñ",
    "&ordm;": "º", "&ordf;": "ª",
    "&sect;": "§", "&para;": "¶",
    "&deg;": "°", "&copy;": "©",
    "&reg;": "®", "&trade;": "™",
    "&ndash;": "–", "&mdash;": "—",
    "&lsquo;": "'", "&rsquo;": "'",
    "&ldquo;": "\u201C", "&rdquo;": "\u201D",
    "&bull;": "•", "&hellip;": "…",
  };
  
  // Replace named entities
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }
  
  // Replace numeric entities (&#224; -> à, &#xe0; -> à)
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return result;
}

async function fetchAndCleanText(url: string): Promise<string> {
  const response = await fetchWithRetry(url);
  
  // Get raw bytes and decode as ISO-8859-1 (Latin-1) since Planalto uses this encoding
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder("iso-8859-1");
  const html = decoder.decode(buffer);
  
  // Remove HTML tags and clean up text
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Decode HTML entities
  text = decodeHtmlEntities(text);
  
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
