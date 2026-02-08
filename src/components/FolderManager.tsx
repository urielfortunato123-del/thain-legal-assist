import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  File,
  FileType,
  Database,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder as FolderType, useFolders } from "@/hooks/useFolders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function getIconComponent(iconName: string | null) {
  switch (iconName) {
    case "database":
      return Database;
    case "file-text":
      return FileText;
    case "file-type":
      return FileType;
    case "file":
      return File;
    default:
      return Folder;
  }
}

interface FolderManagerProps {
  folders: FolderType[];
  onFolderClick?: (folder: FolderType) => void;
  documentCounts?: Record<string, number>;
}

export default function FolderManager({ folders, onFolderClick, documentCounts = {} }: FolderManagerProps) {
  const { createFolder, updateFolder, deleteFolder } = useFolders();
  const [isManaging, setIsManaging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

  const handleEdit = (folder: FolderType) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateFolder(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pasta?")) {
      await deleteFolder(id);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName);
      setNewFolderName("");
      setShowNewFolderDialog(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">Pastas</h2>
        <div className="flex gap-2">
          <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Pasta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Nome da pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFolder}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isManaging ? "text-primary" : ""}`}
            onClick={() => setIsManaging(!isManaging)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {folders.map((folder, i) => {
          const IconComponent = getIconComponent(folder.icon);
          const isEditing = editingId === folder.id;
          const count = documentCounts[folder.name] || 0;

          return (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              {isEditing ? (
                <div className="flex items-center gap-1 p-2 rounded-xl bg-card border border-primary">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    className="h-8 text-xs"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 text-success hover:bg-secondary rounded"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 text-destructive hover:bg-secondary rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => !isManaging && onFolderClick?.(folder)}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left"
                >
                  <IconComponent className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{folder.name}</p>
                    <p className="text-[10px] text-muted-foreground">{count} itens</p>
                  </div>
                  {isManaging && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(folder);
                        }}
                        className="p-1 text-muted-foreground hover:text-primary rounded"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(folder.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
