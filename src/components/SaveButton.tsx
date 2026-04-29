import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props extends Omit<ButtonProps, "onClick"> {
  /** Optional async save handler. Resolves before showing the success state. */
  onSave?: () => void | Promise<void>;
  /** Toast text shown on success. Set to null to disable. */
  toastText?: string | null;
  /** Default label */
  children: React.ReactNode;
  /** Label shown briefly after success */
  successLabel?: string;
}

/**
 * Botão "Guardar" com animação consistente:
 * idle → loading (spinner) → success (✓ verde-lima por 1.2s) → idle.
 * Usado em todas as ações de gravar/atualizar do PT/Cliente.
 */
export function SaveButton({
  onSave,
  toastText = "Alterações guardadas",
  children,
  successLabel = "Guardado",
  className,
  disabled,
  ...rest
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "ok">("idle");

  async function handle() {
    if (state !== "idle") return;
    setState("loading");
    try {
      await Promise.resolve(onSave?.());
      setState("ok");
      if (toastText) toast.success(toastText);
      setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("idle");
      toast.error("Não foi possível guardar");
    }
  }

  return (
    <Button
      type="button"
      onClick={handle}
      disabled={disabled || state !== "idle"}
      className={cn(
        "relative overflow-hidden bg-gradient-primary text-primary-foreground transition-all hover:opacity-90",
        state === "ok" && "scale-[0.98]",
        className,
      )}
      {...rest}
    >
      <span className={cn("inline-flex items-center gap-2 transition-opacity", state !== "idle" && "opacity-0")}>{children}</span>
      {state === "loading" && (
        <span className="absolute inset-0 grid place-items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
      {state === "ok" && (
        <span className="absolute inset-0 grid place-items-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Check className="h-4 w-4" /> {successLabel}
          </span>
        </span>
      )}
    </Button>
  );
}
