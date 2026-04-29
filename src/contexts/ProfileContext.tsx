import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Perfil local — guarda avatar, nome e dados básicos no localStorage.
 * Quando o backend (Lovable Cloud) for ligado, podemos sincronizar daqui.
 */

interface Profile {
  pt: {
    name: string;
    avatarDataUrl: string | null;
  };
  client: {
    name: string;
    avatarDataUrl: string | null;
  };
}

const DEFAULT: Profile = {
  pt: { name: "Ricardo Pereira", avatarDataUrl: null },
  client: { name: "Ana Silva", avatarDataUrl: null },
};

const KEY = "fitpilot.profile.v1";

interface Ctx {
  profile: Profile;
  setPTAvatar: (dataUrl: string | null) => void;
  setClientAvatar: (dataUrl: string | null) => void;
  setPTName: (name: string) => void;
  setClientName: (name: string) => void;
}

const ProfileContext = createContext<Ctx | undefined>(undefined);

function load(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed, pt: { ...DEFAULT.pt, ...parsed.pt }, client: { ...DEFAULT.client, ...parsed.client } };
  } catch {
    return DEFAULT;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* */ }
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setPTAvatar: (d) => setProfile((p) => ({ ...p, pt: { ...p.pt, avatarDataUrl: d } })),
        setClientAvatar: (d) => setProfile((p) => ({ ...p, client: { ...p.client, avatarDataUrl: d } })),
        setPTName: (n) => setProfile((p) => ({ ...p, pt: { ...p.pt, name: n } })),
        setClientName: (n) => setProfile((p) => ({ ...p, client: { ...p.client, name: n } })),
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

/** Helper para converter um File em data-URL (guardamos local sem backend). */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
