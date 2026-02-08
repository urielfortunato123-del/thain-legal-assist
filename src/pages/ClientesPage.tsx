import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  Phone,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useClients, Client, ClientInsert } from "@/hooks/useClients";
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

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function ClientesPage() {
  const { user } = useAuth();
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientInsert>({
    type: "pessoa_fisica",
    name: "",
    document_number: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    state: "PR",
    notes: null,
  });

  const resetForm = () => {
    setFormData({
      type: "pessoa_fisica",
      name: "",
      document_number: null,
      email: null,
      phone: null,
      address: null,
      city: null,
      state: "PR",
      notes: null,
    });
    setEditingClient(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setFormData({
      type: client.type,
      name: client.name,
      document_number: client.document_number,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      notes: client.notes,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      await updateClient(editingClient.id, formData);
    } else {
      await addClient(formData);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (client: Client) => {
    if (confirm(`Excluir cliente "${client.name}"?`)) {
      await deleteClient(client.id);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.document_number?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pf = filteredClients.filter(c => c.type === "pessoa_fisica");
  const pj = filteredClients.filter(c => c.type === "pessoa_juridica");

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Clientes
          </h1>
          <Button size="sm" onClick={openNewForm} disabled={!user} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
            Faça login para gerenciar seus clientes.
          </p>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {user ? "Nenhum cliente cadastrado." : "Faça login para ver seus clientes."}
          </p>
        ) : (
          <div className="space-y-6">
            {pf.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Pessoa Física ({pf.length})
                </h2>
                <ClientList clients={pf} onEdit={openEditForm} onDelete={handleDelete} />
              </section>
            )}
            
            {pj.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-info" />
                  Pessoa Jurídica ({pj.length})
                </h2>
                <ClientList clients={pj} onEdit={openEditForm} onDelete={handleDelete} />
              </section>
            )}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as "pessoa_fisica" | "pessoa_juridica" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.type === "pessoa_fisica" ? "Nome completo" : "Razão social"}
                />
              </div>

              <div className="space-y-2">
                <Label>{formData.type === "pessoa_fisica" ? "CPF" : "CNPJ"}</Label>
                <Input
                  value={formData.document_number || ""}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value || null })}
                  placeholder={formData.type === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.state || "PR"}
                    onValueChange={(v) => setFormData({ ...formData, state: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClient ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function ClientList({ 
  clients, 
  onEdit, 
  onDelete 
}: { 
  clients: Client[]; 
  onEdit: (c: Client) => void; 
  onDelete: (c: Client) => void;
}) {
  return (
    <div className="space-y-2">
      {clients.map((client, i) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            {client.type === "pessoa_fisica" ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-info" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{client.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              {client.document_number && (
                <span>{client.document_number}</span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  {client.email}
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
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ))}
    </div>
  );
}
