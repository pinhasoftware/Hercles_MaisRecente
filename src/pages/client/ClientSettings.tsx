import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Dumbbell, Bell, Calendar, Wallet, Palette, Shield, Cog, Settings as SettingsIcon, LogOut } from "lucide-react";
import { SettingsLayout, type SettingsSection } from "@/components/SettingsLayout";
import { useDemo } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const SECTIONS: SettingsSection[] = [
  { id: "geral", label: "Geral", icon: SettingsIcon, items: ["Idioma", "Fuso horário", "Formato de data", "Unidade de peso"] },
  { id: "perfil", label: "Perfil", icon: User, items: ["Nome", "Idade", "Peso", "Altura", "Objetivos", "Lesões", "Restrições"] },
  { id: "treino", label: "Preferências de Treino", icon: Dumbbell, items: ["Nível", "Dias preferidos", "Horário preferido", "Equipamento disponível", "Tipo de treino", "Hipertrofia", "Força", "Perda de peso", "Resistência"] },
  { id: "notificacoes", label: "Notificações", icon: Bell, items: ["Mensagens do PT", "Lembretes de treino", "Lembretes de pagamento", "Check-ins", "Som das notificações"] },
  { id: "agendamento", label: "Agendamento", icon: Calendar, items: ["Disponibilidade", "Modalidade preferida", "Presencial", "Online"] },
  { id: "pagamentos", label: "Pagamentos e Assinatura", icon: Wallet, items: ["Método de pagamento", "MB WAY", "Histórico", "Gerir assinatura"] },
  { id: "aparencia", label: "Aparência", icon: Palette, items: ["Tema", "Escuro", "Claro"] },
  { id: "seguranca", label: "Privacidade e Segurança", icon: Shield, items: ["Alterar palavra-passe", "Autenticação de dois fatores", "2FA", "Terminar sessão", "Eliminar conta"] },
  { id: "avancadas", label: "Avançadas", icon: Cog, items: ["Versão", "Exportar dados", "Enviar feedback", "Termos de Serviço", "Política de Privacidade"] },
];

export default function ClientSettings() {
  const [active, setActive] = useState<string | null>(null);
  const { setRole } = useDemo();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id && SECTIONS.some((s) => s.id === id)) setActive(id);
  }, [location.hash]);

  function handleSave() {
    toast.success("Definições guardadas", { id: "settings-saved" });
  }

  async function handleLogout() {
    setRole(null);
    await signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <SettingsLayout
      title="Definições"
      backTo="/app"
      sections={SECTIONS}
      active={active}
      onSelect={setActive}
      onSave={handleSave}
    >
      {active === "geral" && (
        <Section title="Geral" desc="Idioma, fuso horário e formatos">
          <FieldSelect label="Idioma" defaultValue="pt-PT" options={[
            { value: "pt-PT", label: "Português" },
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "it", label: "Italiano" },
            { value: "fr", label: "Français" },
          ]}/>
          <FieldSelect label="Fuso horário" defaultValue="Europe/Lisbon" options={[
            { value: "Europe/Lisbon", label: "Europe/Lisbon" },
            { value: "Europe/Madrid", label: "Europe/Madrid" },
          ]}/>
          <FieldSelect label="Formato de data" defaultValue="dmy" options={[
            { value: "dmy", label: "DD/MM/AAAA" },
            { value: "mdy", label: "MM/DD/AAAA" },
          ]}/>
          <FieldSelect label="Unidade de peso" defaultValue="kg" options={[
            { value: "kg", label: "Quilogramas (kg)" },
            { value: "lbs", label: "Libras (lbs)" },
          ]}/>
        </Section>
      )}

      {active === "perfil" && (
        <Section title="Perfil" desc="Os teus dados pessoais e objetivos">
          <Field label="Nome"><Input defaultValue="Ana Silva" /></Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Idade"><Input type="number" /></Field>
            <Field label="Peso (kg)"><Input type="number" step="0.1" /></Field>
            <Field label="Altura (cm)"><Input type="number" /></Field>
          </div>
          <Field label="Objetivos"><Textarea placeholder="O que queres alcançar..." /></Field>
          <Field label="Lesões / restrições"><Textarea placeholder="Se aplicável..." /></Field>
        </Section>
      )}

      {active === "treino" && (
        <Section title="Preferências de Treino" desc="Adapta os treinos ao teu estilo">
          <FieldSelect label="Nível" defaultValue="intermedio" options={[
            { value: "iniciante", label: "Iniciante" },
            { value: "intermedio", label: "Intermédio" },
            { value: "avancado", label: "Avançado" },
          ]}/>
          <Field label="Dias preferidos"><Input placeholder="Seg, Qua, Sex" /></Field>
          <FieldSelect label="Horário preferido" defaultValue="manha" options={[
            { value: "manha", label: "Manhã" },
            { value: "tarde", label: "Tarde" },
            { value: "noite", label: "Noite" },
          ]}/>
          <Field label="Equipamento disponível"><Textarea placeholder="Ex: halteres ajustáveis, banda elástica..." /></Field>
          <FieldSelect label="Tipo de treino" defaultValue="hipertrofia" options={[
            { value: "hipertrofia", label: "Hipertrofia" },
            { value: "forca", label: "Força" },
            { value: "perda_peso", label: "Perda de peso" },
            { value: "resistencia", label: "Resistência" },
          ]}/>
        </Section>
      )}

      {active === "notificacoes" && (
        <Section title="Notificações" desc="O que queres receber no telemóvel">
          <FieldToggle label="Mensagens do PT" defaultChecked />
          <FieldToggle label="Lembretes de treino" defaultChecked />
          <FieldToggle label="Lembretes de pagamento" defaultChecked />
          <FieldToggle label="Check-ins" defaultChecked />
          <FieldToggle label="Som das notificações" defaultChecked />
        </Section>
      )}

      {active === "agendamento" && (
        <Section title="Agendamento" desc="Disponibilidade e modalidade">
          <Field label="Disponibilidade"><Input placeholder="Seg-Sex 18:00-21:00" /></Field>
          <FieldSelect label="Modalidade preferida" defaultValue="presencial" options={[
            { value: "presencial", label: "Presencial" },
            { value: "online", label: "Online" },
          ]}/>
        </Section>
      )}

      {active === "pagamentos" && (
        <Section title="Pagamentos e Assinatura" desc="Método atual e histórico">
          <FieldSelect label="Método de pagamento" defaultValue="mbway" options={[
            { value: "mbway", label: "MB WAY" },
            { value: "transferencia", label: "Transferência" },
            { value: "cartao", label: "Cartão" },
          ]}/>
          <Button variant="outline" className="w-full">Ver histórico de pagamentos</Button>
          <Button variant="outline" className="w-full">Gerir assinatura</Button>
        </Section>
      )}

      {active === "aparencia" && (
        <Section title="Aparência" desc="Tema da app">
          <ThemeField />
        </Section>
      )}

      {active === "seguranca" && (
        <Section title="Privacidade e Segurança" desc="Conta e password">
          <Button variant="outline" className="w-full justify-start">Alterar palavra-passe</Button>
          <FieldToggle label="Autenticação de dois fatores (2FA)" />
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" /> Terminar sessão
          </Button>
          <Button variant="destructive" className="w-full">Eliminar conta</Button>
        </Section>
      )}

      {active === "avancadas" && (
        <Section title="Avançadas" desc="Dados e legal">
          <Field label="Versão"><Input value="v1.0.0" readOnly /></Field>
          <Button variant="outline" className="w-full justify-start">Exportar os meus dados</Button>
          <Button variant="outline" className="w-full justify-start">Enviar feedback</Button>
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground">Termos de Serviço</Button>
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground">Política de Privacidade</Button>
        </Section>
      )}
    </SettingsLayout>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function FieldSelect({ label, defaultValue, options }: { label: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <Select defaultValue={defaultValue}>
        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

function FieldToggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ThemeField() {
  const { theme, setTheme } = useTheme();
  return (
    <Field label="Tema">
      <Select value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="dark">Escuro</SelectItem>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="system">Automático</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
