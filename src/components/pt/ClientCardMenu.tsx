import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  clientName: string;
  onDeleted?: (id: string) => void;
  className?: string;
}

/**
 * Three-dots menu attached to any client card.
 * - Editar → goes to client profile
 * - Eliminar → opens confirm dialog requiring user to type "ELIMINAR"
 */
export function ClientCardMenu({ clientId, clientName, onDeleted, className }: Props) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [text, setText] = useState("");

  const canDelete = text.trim().toUpperCase() === "ELIMINAR";

  function handleDelete() {
    if (!canDelete) return;
    onDeleted?.(clientId);
    toast.success(`${clientName} eliminado.`);
    setConfirmOpen(false);
    setText("");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground",
              className,
            )}
            aria-label="Opções"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => navigate(`/pt/clients/${clientId}`)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar info
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) setText(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Eliminar cliente</DialogTitle>
            <DialogDescription>
              Vais eliminar <strong>{clientName}</strong> e todos os dados associados.
              Esta ação não pode ser revertida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Para confirmar, escreve <span className="font-mono font-bold text-destructive">ELIMINAR</span> abaixo:
            </p>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ELIMINAR"
              className="rounded-xl font-mono"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete}
              onClick={handleDelete}
              className="disabled:opacity-40"
            >
              Confirmar eliminação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
