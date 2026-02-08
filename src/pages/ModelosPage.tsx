import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  FileSignature,
  FileCheck,
  ScrollText,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useDocumentTemplates, DocumentTemplate, TemplateInsert } from "@/hooks/useDocumentTemplates";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "peticao", label: "Petição", icon: FileSignature },
  { value: "contrato", label: "Contrato", icon: FileCheck },
  { value: "procuracao", label: "Procuração", icon: ScrollText },
  { value: "outro", label: "Outro", icon: FileText },
];

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  peticao: FileSignature,
  contrato: FileCheck,
  procuracao: ScrollText,
  outro: FileText,
};

export default function ModelosPage() {
  const { user } = useAuth();
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate, extractVariables } = useDocumentTemplates();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateInsert>({
    name: "",
    category: "peticao",
    description: null,
    content: "",
    variables: [],
    is_default: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "peticao",
      description: null,
      content: "",
      variables: [],
      is_default: false,
    });
    setEditingTemplate(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      description: template.description,
      content: template.content,
      variables: template.variables,
      is_default: template.is_default,
    });
    setShowForm(true);
  };

  const openPreview = (template: DocumentTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract variables from content
    const vars = extractVariables(formData.content);
    const dataWithVars = { ...formData, variables: vars };
    
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, dataWithVars);
    } else {
      await addTemplate(dataWithVars);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (template: DocumentTemplate) => {
    if (confirm(`Excluir modelo "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência!");
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTemplates = CATEGORIES.map(cat => ({
    ...cat,
    templates: filteredTemplates.filter(t => t.category === cat.value),
  })).filter(g => g.templates.length > 0);

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Modelos
          </h1>
          <Button size="sm" onClick={openNewForm} disabled={!user} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
            Faça login para gerenciar seus modelos.
          </p>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-sm"
          />
        </div>

        {/* Info about variables */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <p className="text-primary font-medium">💡 Dica: Use variáveis</p>
          <p className="text-muted-foreground mt-1">
            Adicione <code className="bg-secondary px-1 rounded">{"{{nome}}"}</code> no texto e ele será substituído automaticamente.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {user ? "Nenhum modelo cadastrado." : "Faça login para ver seus modelos."}
          </p>
        ) : (
          <div className="space-y-6">
            {groupedTemplates.map(group => (
              <section key={group.value}>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                  <group.icon className="h-4 w-4 text-primary" />
                  {group.label} ({group.templates.length})
                </h2>
                <div className="space-y-2">
                  {group.templates.map((template, i) => {
                    const Icon = CATEGORY_ICONS[template.category || "outro"] || FileText;
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group cursor-pointer"
                        onClick={() => openPreview(template)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {template.description}
                            </p>
                          )}
                          {template.variables.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {template.variables.slice(0, 3).map(v => (
                                <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                  {v}
                                </span>
                              ))}
                              {template.variables.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{template.variables.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openPreview(template); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyToClipboard(template.content); }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditForm(template); }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDelete(template); }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Modelo" : "Novo Modelo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Procuração Ad Judicia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category || "outro"}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  placeholder="Breve descrição do modelo"
                />
              </div>

              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                <Label>Conteúdo *</Label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="flex-1 min-h-[200px] font-mono text-sm resize-none"
                  placeholder={`PROCURAÇÃO AD JUDICIA

Pelo presente instrumento particular de procuração, {{outorgante_nome}}, {{outorgante_nacionalidade}}, {{outorgante_estado_civil}}, {{outorgante_profissao}}, portador(a) do RG nº {{outorgante_rg}} e inscrito(a) no CPF sob o nº {{outorgante_cpf}}, residente e domiciliado(a) à {{outorgante_endereco}}, nomeia e constitui como seu bastante procurador(a) o(a) advogado(a) {{advogado_nome}}, inscrito(a) na OAB/{{advogado_oab_estado}} sob o nº {{advogado_oab_numero}}...`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTemplate ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {previewTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            
            {previewTemplate?.variables && previewTemplate.variables.length > 0 && (
              <div className="flex flex-wrap gap-1 pb-2 border-b">
                <span className="text-xs text-muted-foreground mr-2">Variáveis:</span>
                {previewTemplate.variables.map(v => (
                  <span key={v} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
            
            <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {previewTemplate?.content}
              </pre>
            </ScrollArea>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => previewTemplate && copyToClipboard(previewTemplate.content)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={() => previewTemplate && openEditForm(previewTemplate)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
