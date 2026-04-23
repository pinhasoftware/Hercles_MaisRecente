import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function StubPage({ title, subtitle, back = "/pt" }: { title: string; subtitle: string; back?: string }) {
  return (
    <div className="min-h-screen px-5 pb-24 pt-6">
      <Link to={back} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="glass mt-6 rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">A chegar nas próximas iterações.</p>
      </div>
    </div>
  );
}
