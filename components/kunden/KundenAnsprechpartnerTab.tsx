"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCRM } from "@/lib/crm-context";
import type { Ansprechpartner } from "@/lib/types";

interface Props {
  kundeId: string;
}

interface FormState {
  name: string;
  position: string;
  telefon: string;
  email: string;
  notiz: string;
}

const EMPTY_FORM: FormState = { name: "", position: "", telefon: "", email: "", notiz: "" };

export function KundenAnsprechpartnerTab({ kundeId }: Props) {
  const { ansprechpartner, addAnsprechpartner, updateAnsprechpartner, deleteAnsprechpartner } = useCRM();

  const list = ansprechpartner.filter((a) => a.kunde_id === kundeId);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);

  // Edit state: which id is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    addAnsprechpartner({
      id: `ap-${Date.now()}`,
      kunde_id: kundeId,
      name: addForm.name.trim(),
      position: addForm.position.trim() || undefined,
      telefon: addForm.telefon.trim() || undefined,
      email: addForm.email.trim() || undefined,
      notiz: addForm.notiz.trim() || undefined,
      created_at: new Date().toISOString(),
    });
    setAddForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  const startEdit = (ap: Ansprechpartner) => {
    setEditingId(ap.id);
    setEditForm({
      name: ap.name,
      position: ap.position || "",
      telefon: ap.telefon || "",
      email: ap.email || "",
      notiz: ap.notiz || "",
    });
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateAnsprechpartner(editingId, {
      name: editForm.name.trim(),
      position: editForm.position.trim() || undefined,
      telefon: editForm.telefon.trim() || undefined,
      email: editForm.email.trim() || undefined,
      notiz: editForm.notiz.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteAnsprechpartner(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 py-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {list.length === 0 ? "Noch kein Ansprechpartner erfasst" : `${list.length} Ansprechpartner`}
        </p>
        {!showAddForm && (
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Ansprechpartner hinzufügen
          </Button>
        )}
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Neuer Ansprechpartner</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
              <Input
                autoFocus
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Max Mustermann"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Position / Abteilung</Label>
              <Input
                value={addForm.position}
                onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="Einkaufsleiter"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input
                value={addForm.telefon}
                onChange={(e) => setAddForm((f) => ({ ...f, telefon: e.target.value }))}
                placeholder="+49 211 000 000"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-Mail</Label>
              <Input
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="max@firma.de"
                className="h-8 text-sm"
                type="email"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Notiz</Label>
              <Input
                value={addForm.notiz}
                onChange={(e) => setAddForm((f) => ({ ...f, notiz: e.target.value }))}
                placeholder="Bevorzugt nachmittags kontaktieren..."
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }}>
              Abbrechen
            </Button>
            <Button size="sm" disabled={!addForm.name.trim()} onClick={handleAdd}>
              Speichern
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {list.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Noch kein Ansprechpartner erfasst</p>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Ansprechpartner hinzufügen
          </Button>
        </div>
      )}

      {/* Ansprechpartner list */}
      <div className="space-y-3">
        {list.map((ap) => {
          const isEditing = editingId === ap.id;
          const isConfirmingDelete = confirmDeleteId === ap.id;

          if (isEditing) {
            return (
              <div key={ap.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                    <Input
                      autoFocus
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position / Abteilung</Label>
                    <Input
                      value={editForm.position}
                      onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefon</Label>
                    <Input
                      value={editForm.telefon}
                      onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">E-Mail</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="h-8 text-sm"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Notiz</Label>
                    <Input
                      value={editForm.notiz}
                      onChange={(e) => setEditForm((f) => ({ ...f, notiz: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                  </Button>
                  <Button size="sm" disabled={!editForm.name.trim()} onClick={handleSaveEdit}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Speichern
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={ap.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{ap.name}</p>
                    {ap.position && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {ap.position}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {ap.telefon && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 shrink-0" />
                        <a href={`tel:${ap.telefon}`} className="hover:text-[#E3000F] transition-colors">
                          {ap.telefon}
                        </a>
                      </div>
                    )}
                    {ap.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" />
                        <a href={`mailto:${ap.email}`} className="hover:text-[#E3000F] transition-colors truncate">
                          {ap.email}
                        </a>
                      </div>
                    )}
                    {ap.notiz && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">{ap.notiz}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(ap)}
                    title="Bearbeiten"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDeleteId(ap.id)}
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Inline delete confirmation */}
              {isConfirmingDelete && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Wirklich löschen?</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>
                      Nein
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(ap.id)}>
                      Ja, löschen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
