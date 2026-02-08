import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const filters = ["Todos", "Constituição", "Código", "Lei", "Decreto"];

const mockResults = [
  {
    title: "Código de Defesa do Consumidor",
    identifier: "Lei nº 8.078/1990",
    snippet: 'Art. 6º — São direitos básicos do consumidor: [...] VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos.',
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
  },
  {
    title: "Código Civil",
    identifier: "Lei nº 10.406/2002",
    snippet: 'Art. 186 — Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.',
    url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",
  },
  {
    title: "Constituição Federal",
    identifier: "CF/1988",
    snippet: 'Art. 5º, V — é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem.',
    url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
  },
];

export default function LeisPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searched, setSearched] = useState(false);

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl font-bold">Consulta de Leis</h1>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder='Buscar: "dano moral", "usucapião"...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border-border text-sm flex-1"
          />
          <Button
            onClick={() => setSearched(true)}
            className="bg-primary text-primary-foreground hover:opacity-90 px-6"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">
              {mockResults.length} resultados para "{search || "dano moral"}"
            </p>
            {mockResults.map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border space-y-2 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{result.title}</h3>
                    <p className="text-xs text-primary mt-0.5">{result.identifier}</p>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.snippet}
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Ver texto completo <ExternalLink className="h-3 w-3" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
