import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useDeadlines, Deadline, DeadlineInsert } from "@/hooks/useDeadlines";
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
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-info/20 text-info",
  high: "bg-warning/20 text-warning",
  urgent: "bg-destructive/20 text-destructive",
};

const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getDaysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PrazosPage() {
  const { user } = useAuth();
  const { deadlines, loading, addDeadline, updateDeadline, completeDeadline, deleteDeadline, getOverdue, getUpcoming } = useDeadlines();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState<DeadlineInsert>({
    title: "",
    description: null,
    deadline_date: new Date().toISOString().split("T")[0],
    deadline_time: null,
    priority: "medium",
    status: "pendente",
    reminder_days: 3,
    process_id: null,
    case_id: null,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: null,
      deadline_date: new Date().toISOString().split("T")[0],
      deadline_time: null,
      priority: "medium",
      status: "pendente",
      reminder_days: 3,
      process_id: null,
      case_id: null,
    });
    setEditingDeadline(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setFormData({
      title: deadline.title,
      description: deadline.description,
      deadline_date: deadline.deadline_date,
      deadline_time: deadline.deadline_time,
      priority: deadline.priority,
      status: deadline.status,
      reminder_days: deadline.reminder_days,
      process_id: deadline.process_id,
      case_id: deadline.case_id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDeadline) {
      await updateDeadline(editingDeadline.id, formData);
    } else {
      await addDeadline(formData);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (deadline: Deadline) => {
    if (confirm(`Excluir prazo "${deadline.title}"?`)) {
      await deleteDeadline(deadline.id);
    }
  };

  const filteredDeadlines = deadlines.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const overdue = getOverdue();
  const upcoming = getUpcoming();
  const pendentes = filteredDeadlines.filter(d => d.status === "pendente" && !overdue.includes(d) && !upcoming.includes(d));
  const concluidos = filteredDeadlines.filter(d => d.status === "concluido");

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Prazos
          </h1>
          <Button size="sm" onClick={openNewForm} disabled={!user} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
            Faça login para gerenciar seus prazos.
          </p>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prazos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {user ? "Nenhum prazo cadastrado." : "Faça login para ver seus prazos."}
          </p>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Atrasados ({overdue.length})
                </h2>
                <DeadlineList 
                  deadlines={overdue} 
                  onEdit={openEditForm} 
                  onDelete={handleDelete}
                  onComplete={completeDeadline}
                />
              </section>
            )}
            
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-warning">
                  <Clock className="h-4 w-4" />
                  Próximos 7 dias ({upcoming.length})
                </h2>
                <DeadlineList 
                  deadlines={upcoming} 
                  onEdit={openEditForm} 
                  onDelete={handleDelete}
                  onComplete={completeDeadline}
                />
              </section>
            )}

            {pendentes.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Pendentes ({pendentes.length})
                </h2>
                <DeadlineList 
                  deadlines={pendentes} 
                  onEdit={openEditForm} 
                  onDelete={handleDelete}
                  onComplete={completeDeadline}
                />
              </section>
            )}

            {concluidos.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Concluídos ({concluidos.length})
                </h2>
                <DeadlineList 
                  deadlines={concluidos.slice(0, 5)} 
                  onEdit={openEditForm} 
                  onDelete={handleDelete}
                  onComplete={completeDeadline}
                  completed
                />
              </section>
            )}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDeadline ? "Editar Prazo" : "Novo Prazo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Contestação Silva vs. Empresa ABC"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.deadline_date}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={formData.deadline_time || ""}
                    onChange={(e) => setFormData({ ...formData, deadline_time: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lembrete (dias antes)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={formData.reminder_days}
                    onChange={(e) => setFormData({ ...formData, reminder_days: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  rows={3}
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDeadline ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function DeadlineList({ 
  deadlines, 
  onEdit, 
  onDelete,
  onComplete,
  completed = false,
}: { 
  deadlines: Deadline[]; 
  onEdit: (d: Deadline) => void; 
  onDelete: (d: Deadline) => void;
  onComplete: (id: string) => void;
  completed?: boolean;
}) {
  return (
    <div className="space-y-2">
      {deadlines.map((deadline, i) => {
        const daysUntil = getDaysUntil(deadline.deadline_date);
        const isOverdue = daysUntil < 0 && !completed;
        
        return (
          <motion.div
            key={deadline.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 p-3 rounded-xl bg-card border transition-all group ${
              isOverdue ? "border-destructive/50" : "border-border hover:border-primary/30"
            } ${completed ? "opacity-60" : ""}`}
          >
            {!completed && (
              <button
                onClick={() => onComplete(deadline.id)}
                className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-colors shrink-0"
              />
            )}
            {completed && (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${completed ? "line-through" : ""}`}>
                  {deadline.title}
                </p>
                <Badge className={`text-[10px] px-1.5 ${PRIORITY_COLORS[deadline.priority]}`}>
                  {PRIORITY_LABELS[deadline.priority]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  {formatDate(deadline.deadline_date)}
                  {deadline.deadline_time && ` às ${deadline.deadline_time.slice(0, 5)}`}
                </span>
                {!completed && (
                  <span className={isOverdue ? "text-destructive" : daysUntil <= 3 ? "text-warning" : ""}>
                    {isOverdue 
                      ? `${Math.abs(daysUntil)} dia${Math.abs(daysUntil) > 1 ? 's' : ''} atrasado`
                      : daysUntil === 0 
                        ? "Hoje!" 
                        : `${daysUntil} dia${daysUntil > 1 ? 's' : ''}`
                    }
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(deadline)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(deadline)}
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
  );
}
