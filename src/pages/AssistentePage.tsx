import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, CheckSquare, FileEdit, BookmarkPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: `Olá, Thainá! Sou sua assistente jurídica. Posso ajudá-la com:

• **Consultas legais** com base em fontes oficiais
• **Análise de casos** PF e PJ  
• **Geração de minutas** usando seus modelos
• **Checklists práticos** para procedimentos

Como posso ajudar hoje?`,
  },
];

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"PF" | "PJ">("PF");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated response
    setTimeout(() => {
      const response: Message = {
        role: "assistant",
        content: `**Resumo:**
A questão sobre dano moral no direito do consumidor encontra amparo na legislação vigente, com indenizações que devem observar o princípio da razoabilidade.

**Base Legal:**
- [Art. 6º, VI — CDC (Lei 8.078/90)](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) — prevenção e reparação de danos
- [Art. 186 — Código Civil](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm) — ato ilícito
- [Art. 5º, V — CF/88](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm) — indenização por dano moral

**Riscos e Teses Contrárias:**
- Réu pode alegar mero dissabor / inexistência de prova do dano
- Necessidade de comprovação do nexo causal

**Checklist Prático:**
1. Reunir provas documentais (prints, protocolos, e-mails)
2. Verificar prescrição (5 anos — CDC)
3. Calcular valor pretendido com base em jurisprudência local
4. Analisar viabilidade de tutela de urgência

⚠️ *A análise depende do caso concreto e da prova disponível.*`,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="font-serif text-lg font-semibold">Assistente IA</h1>
          </div>
          <div className="flex bg-secondary rounded-full p-0.5">
            {(["PF", "PJ"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/20" : "bg-secondary"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-card border border-border rounded-tl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/20">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0 border-border">
            <CheckSquare className="h-3 w-3" /> Gerar Checklist
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0 border-border">
            <FileEdit className="h-3 w-3" /> Rascunhar Peça
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0 border-border">
            <BookmarkPlus className="h-3 w-3" /> Salvar como Nota
          </Button>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Pergunte algo..."
              rows={1}
              className="flex-1 resize-none rounded-xl bg-secondary border border-border p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px] max-h-32"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-primary text-primary-foreground hover:opacity-90 h-11 w-11 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
