"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, List, Plus, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KundenCard } from "@/components/kunden/KundenCard";
import { KundenTable } from "@/components/kunden/KundenTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NeuerKundeModal } from "@/components/modals/NeuerKundeModal";
import { mockKunden } from "@/lib/mock-data";
import type { Kunde } from "@/lib/types";

type ViewMode = "grid" | "table";
type StatusFilter = "alle" | "aktiv" | "inaktiv" | "neu";

export default function KundenPage() {
  const [kunden, setKunden] = useState<Kunde[]>(mockKunden);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [brancheFilter, setBrancheFilter] = useState("alle");
  const [showModal, setShowModal] = useState(false);

  const branchen = ["alle", ...Array.from(new Set(kunden.map((k) => k.branche).filter(Boolean)))];

  const filtered = useMemo(() => {
    return kunden.filter((k) => {
      const matchesSearch =
        !search ||
        k.name1.toLowerCase().includes(search.toLowerCase()) ||
        k.nummer.toLowerCase().includes(search.toLowerCase()) ||
        k.ort?.toLowerCase().includes(search.toLowerCase()) ||
        k.branche?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "alle" || k.status === statusFilter;
      const matchesBranche = brancheFilter === "alle" || k.branche === brancheFilter;
      return matchesSearch && matchesStatus && matchesBranche;
    });
  }, [kunden, search, statusFilter, brancheFilter]);

  const counts = {
    alle: kunden.length,
    aktiv: kunden.filter((k) => k.status === "aktiv").length,
    inaktiv: kunden.filter((k) => k.status === "inaktiv").length,
    neu: kunden.filter((k) => k.status === "neu").length,
  };

  const handleAdd = (kunde: Kunde) => {
    setKunden((prev) => [kunde, ...prev]);
  };

  return (
    <div>
      <Header title="Kunden" subtitle={`${counts.alle} Kunden insgesamt`} />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kunden suchen..."
              className="pl-9"
            />
          </div>

          <Select value={brancheFilter} onValueChange={setBrancheFilter}>
            <SelectTrigger className="w-44">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Branche" />
            </SelectTrigger>
            <SelectContent>
              {branchen.map((b) => (
                <SelectItem key={b} value={b || "alle"}>
                  {b === "alle" ? "Alle Branchen" : b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button className="gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Neuer Kunde
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["alle", "aktiv", "inaktiv", "neu"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#E3000F] text-white"
                  : "bg-muted hover:bg-muted/70 text-muted-foreground"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  statusFilter === status ? "bg-white/20 text-white" : "bg-background text-foreground"
                }`}
              >
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} von {kunden.length} Kunden</p>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((kunde) => (
              <KundenCard key={kunde.id} kunde={kunde} />
            ))}
          </div>
        ) : (
          <KundenTable kunden={filtered} />
        )}
      </div>

      <NeuerKundeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
