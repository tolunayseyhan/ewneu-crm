"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate login (replace with actual Supabase auth)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === "demo@ewneu.de" && password === "demo123") {
      router.push("/");
    } else {
      setError("E-Mail oder Passwort ist falsch.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1117] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E3000F]/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#E3000F]/3 blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-[#E3000F] shadow-2xl shadow-red-900/40 mx-auto mb-8">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">EWNEU CRM</h1>
          <p className="text-[#94a3b8] text-lg mb-12">
            Modernes Customer Relationship Management für Ihr Vertriebsteam
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Kunden", value: "10+" },
              { label: "Aufgaben", value: "8" },
              { label: "Umsatz", value: "2.2M€" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E3000F]">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">EWNEU CRM</p>
              <p className="text-xs text-muted-foreground">Anmelden</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Anmelden</h2>
            <p className="text-muted-foreground mt-1">
              Melden Sie sich mit Ihrem Konto an
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <button
                  type="button"
                  className="text-xs text-[#E3000F] hover:text-[#cc000e] transition-colors"
                >
                  Passwort vergessen?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Demo-Zugangsdaten:
            </p>
            <p className="text-xs text-muted-foreground">
              E-Mail: <span className="font-mono text-foreground">demo@ewneu.de</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Passwort: <span className="font-mono text-foreground">demo123</span>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 EWNEU CRM · Alle Rechte vorbehalten
          </p>
        </div>
      </div>
    </div>
  );
}
