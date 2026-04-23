import { AlertTriangle, Euro, TrendingUp, WalletCards } from "lucide-react";
import { mockClients, mockPayments, overduePayments } from "@/lib/mocks";

export default function PTBusiness() {
  const revenue = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdue = overduePayments();

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Finanças</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Faturação</h1>
      </header>
      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4"><Euro className="h-5 w-5 text-primary" /><p className="mt-3 text-3xl font-black">{revenue}€</p><p className="text-xs text-muted-foreground">previsto</p></div>
        <div className="glass rounded-2xl p-4"><AlertTriangle className="h-5 w-5 text-energy" /><p className="mt-3 text-3xl font-black">{overdue.length}</p><p className="text-xs text-muted-foreground">em atraso</p></div>
      </section>
      <section className="glass-strong mt-6 rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">Receita por cliente</p><TrendingUp className="h-5 w-5 text-primary" /></div>
        <div className="space-y-3">
          {mockPayments.map((payment) => {
            const client = mockClients.find((item) => item.id === payment.client_id)!;
            return <div key={payment.id} className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-bold">{client.full_name}</p><p className="text-xs text-muted-foreground">Vence {payment.due_date}</p></div><p className="font-black">{payment.amount}€</p></div>;
          })}
        </div>
      </section>
    </div>
  );
}
