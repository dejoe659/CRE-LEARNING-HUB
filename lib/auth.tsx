"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase/client";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  department: string;
  level: number;
  role: "student" | "admin";
}

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  department: string;
  level: number;
}

interface AuthCtx {
  user: Profile | null;
  loading: boolean;
  demo: boolean;
  register: (i: RegisterInput) => Promise<{ error?: string; needsConfirm?: boolean }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  forgot: (email: string) => Promise<{ error?: string }>;
  resetPassword: (password: string) => Promise<{ error?: string }>;
  updateProfile: (p: Partial<Profile>) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthCtx | null>(null);
const DEMO_KEY = "cre.demo.user";
const DEMO_USERS = "cre.demo.users";

const readDemoUsers = (): (Profile & { password: string })[] => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS) || "[]");
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const demo = !isSupabaseConfigured();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSupabaseProfile = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    if (!data.user) {
      setUser(null);
      return;
    }
    const { data: p } = await sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    setUser({
      id: data.user.id,
      email: data.user.email ?? "",
      fullName: p?.full_name ?? data.user.user_metadata?.full_name ?? "Student",
      institution: p?.institution ?? "",
      department: p?.department ?? "",
      level: p?.level ?? 100,
      role: p?.role ?? "student",
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (demo) {
        try {
          const raw = localStorage.getItem(DEMO_KEY);
          if (raw) setUser(JSON.parse(raw));
        } catch {}
      } else {
        await loadSupabaseProfile();
        getSupabase()?.auth.onAuthStateChange(() => loadSupabaseProfile());
      }
      setLoading(false);
    })();
  }, [demo, loadSupabaseProfile]);

  const register: AuthCtx["register"] = async (i) => {
    if (demo) {
      const users = readDemoUsers();
      if (users.some((u) => u.email.toLowerCase() === i.email.toLowerCase()))
        return { error: "An account with this email already exists." };
      const profile: Profile = {
        id: crypto.randomUUID(),
        fullName: i.fullName,
        email: i.email,
        institution: i.institution,
        department: i.department,
        level: i.level,
        role: i.email.toLowerCase().startsWith("admin") ? "admin" : "student",
      };
      localStorage.setItem(DEMO_USERS, JSON.stringify([...users, { ...profile, password: i.password }]));
      localStorage.setItem(DEMO_KEY, JSON.stringify(profile));
      setUser(profile);
      return {};
    }
    const sb = getSupabase()!;
    const { data, error } = await sb.auth.signUp({
      email: i.email,
      password: i.password,
      options: {
        data: {
          full_name: i.fullName,
          institution: i.institution,
          department: i.department,
          level: i.level,
        },
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    });
    if (error) return { error: error.message };
    if (!data.session) return { needsConfirm: true };
    await loadSupabaseProfile();
    return {};
  };

  const login: AuthCtx["login"] = async (email, password) => {
    if (demo) {
      const u = readDemoUsers().find(
        (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
      );
      if (!u) return { error: "Incorrect email or password." };
      const { password: _pw, ...profile } = u;
      localStorage.setItem(DEMO_KEY, JSON.stringify(profile));
      setUser(profile);
      return {};
    }
    const { error } = await getSupabase()!.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await loadSupabaseProfile();
    return {};
  };

  const logout = async () => {
    if (demo) localStorage.removeItem(DEMO_KEY);
    else await getSupabase()!.auth.signOut();
    setUser(null);
  };

  const forgot: AuthCtx["forgot"] = async (email) => {
    if (demo) {
      return readDemoUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())
        ? {}
        : { error: "No demo account found with that email." };
    }
    const { error } = await getSupabase()!.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    return error ? { error: error.message } : {};
  };

  const resetPassword: AuthCtx["resetPassword"] = async (password) => {
    if (demo) {
      return { error: "Password reset by email requires Supabase. In demo mode, register a new account." };
    }
    const { error } = await getSupabase()!.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  };

  const updateProfile: AuthCtx["updateProfile"] = async (p) => {
    if (!user) return { error: "Not signed in." };
    const next = { ...user, ...p };
    if (demo) {
      localStorage.setItem(DEMO_KEY, JSON.stringify(next));
      const users = readDemoUsers().map((u) => (u.id === user.id ? { ...u, ...p } : u));
      localStorage.setItem(DEMO_USERS, JSON.stringify(users));
    } else {
      const { error } = await getSupabase()!
        .from("profiles")
        .update({
          full_name: next.fullName,
          institution: next.institution,
          department: next.department,
          level: next.level,
        })
        .eq("id", user.id);
      if (error) return { error: error.message };
    }
    setUser(next);
    return {};
  };

  return (
    <Ctx.Provider value={{ user, loading, demo, register, login, logout, forgot, resetPassword, updateProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside <AuthProvider>");
  return c;
};
