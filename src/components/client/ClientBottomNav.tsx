import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, MessageCircle, Apple, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockChats } from "@/lib/mocks";

const ME_ID = "c1";

export function ClientBottomNav() {
  const { pathname } = useLocation();
  const unread = mockChats.filter((m) => m.client_id === ME_ID && m.sender_role === "trainer" && !m.read).length;

  const tabs = [
    { to: "/app", label: "Home", icon: Home, end: true, badge: 0 },
    { to: "/app/workout", label: "Treino", icon: Dumbbell, badge: 0 },
    { to: "/app/chat", label: "Chat", icon: MessageCircle, badge: unread },
    { to: "/app/nutrition", label: "Nutrição", icon: Apple, badge: 0 },
    { to: "/app/progress", label: "Progresso", icon: TrendingUp, badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md border-t border-border/60 bg-background/85 backdrop-blur-xl">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end, badge }) => {
            const active = end ? pathname === to : pathname.startsWith(to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className={cn("relative grid h-7 w-7 place-items-center", active && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                    {badge > 0 && (
                      <span className="absolute -right-1.5 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
