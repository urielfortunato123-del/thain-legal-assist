import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, filePath } = await req.json();

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: "documentId and filePath are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text from PDF using pdf-parse alternative for Deno
    let extractedText = "";
    
    const fileType = filePath.split(".").pop()?.toLowerCase();
    
    if (fileType === "pdf") {
      // For PDFs, we'll use a simple text extraction
      // In production, you'd use a PDF parsing library or service
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Simple text extraction from PDF (basic approach)
      // This extracts visible text strings from the PDF
      const text = new TextDecoder("latin1").decode(bytes);
      
      // Extract text between stream/endstream markers and clean it
      const textMatches = text.match(/\(([^)]+)\)/g) || [];
      extractedText = textMatches
        .map(m => m.slice(1, -1))
        .filter(t => t.length > 2 && /[a-zA-ZÀ-ú]/.test(t))
        .join(" ")
        .replace(/\\[nrt]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      // If basic extraction didn't work well, try BT/ET blocks
      if (extractedText.length < 100) {
        const btMatches = text.match(/BT[\s\S]*?ET/g) || [];
        extractedText = btMatches
          .join(" ")
          .replace(/\(([^)]+)\)/g, "$1 ")
          .replace(/[^\w\s.,;:!?À-ú-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else if (["txt", "md"].includes(fileType || "")) {
      extractedText = await fileData.text();
    } else if (["doc", "docx"].includes(fileType || "")) {
      // For DOCX, extract text from XML
      extractedText = "[Documento Word - extração automática limitada]";
    }

    // Update the document with extracted text
    const { error: updateError } = await supabase
      .from("documents")
      .update({ 
        content_text: extractedText.slice(0, 100000), // Limit to 100k chars
        is_knowledge_base: true 
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        textLength: extractedText.length,
        preview: extractedText.slice(0, 200) 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
