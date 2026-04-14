"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Loader2, UserRound, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenseStore } from "@/lib/store";
import * as api from "@/lib/api-client";
import type { Profile } from "@/types/profile";

export default function ProfilesPage() {
  const { toast } = useToast();
  const { settings, updateSettings } = useExpenseStore();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editing, setEditing] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#e11d48");
  const [editIncome, setEditIncome] = useState(0);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const activeProfiles = useMemo(
    () => profiles.filter((p) => p.status === "active"),
    [profiles],
  );
  const invitedProfiles = useMemo(
    () => profiles.filter((p) => p.status === "invited"),
    [profiles],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.fetchProfiles();
        setProfiles(result);
      } catch {
        toast("Не вдалося завантажити профілі", "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [toast]);

  const openEdit = (p: Profile) => {
    setEditing(p);
    setEditName(p.name);
    setEditColor(p.color);
    setEditIncome(p.monthlyIncome);
  };

  const handleSaveProfile = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) {
      toast("Введіть ім'я профілю", "error");
      return;
    }

    setSavingId(editing.id);
    try {
      const updated = await api.updateProfile(editing.id, {
        name,
        color: editColor,
        monthlyIncome: editIncome,
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );

      if (updated.id === "person1") {
        updateSettings({
          person1Name: updated.name,
          person1Color: updated.color,
          person1Income: updated.monthlyIncome,
        });
      }
      if (updated.id === "person2") {
        updateSettings({
          person2Name: updated.name,
          person2Color: updated.color,
          person2Income: updated.monthlyIncome,
        });
      }

      toast("Профіль оновлено", "success");
      setEditing(null);
    } catch {
      toast("Не вдалося оновити профіль", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleInvite = async () => {
    const name = inviteName.trim();
    const email = inviteEmail.trim();
    if (!name || !email) {
      toast("Заповніть ім'я та email", "error");
      return;
    }

    setSavingId("invite");
    try {
      const created = await api.createProfile({
        name,
        inviteEmail: email,
        status: "invited",
        role: "member",
        color: "#6366f1",
        monthlyIncome: 0,
      });
      setProfiles((prev) => [...prev, created]);
      setInviteName("");
      setInviteEmail("");
      setShowInvite(false);
      toast("Запрошення-заготовку створено", "success");
    } catch {
      toast("Не вдалося створити запрошення", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveInvite = async (id: string) => {
    setSavingId(id);
    try {
      await api.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast("Запрошення видалено", "success");
    } catch {
      toast("Не вдалося видалити", "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <Loader2 className="h-4 w-4 animate-spin" /> Завантаження профілів…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Профілі
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            Заготовка під сімейні акаунти, інвайти та майбутню логінізацію
          </p>
        </div>
        <Button type="button" onClick={() => setShowInvite(true)}>
          <Plus className="h-4 w-4" /> Запросити
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activeProfiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => openEdit(p)}
            className="glass-card text-left rounded-2xl p-4 transition-colors hover:bg-foreground/5"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${p.color}22`, color: p.color }}
              >
                {p.avatarEmoji || "👤"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="text-xs text-foreground/45">
                  {p.role === "owner" ? "Власник" : "Учасник"}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {settings.currency}{" "}
                {Math.round(p.monthlyIncome).toLocaleString("en-US")}
              </span>
            </div>
          </button>
        ))}
      </div>

      {invitedProfiles.length > 0 && (
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold">Очікують запрошення</h2>
          <div className="space-y-2">
            {invitedProfiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-foreground/5 px-3 py-2"
              >
                <Mail className="h-4 w-4 text-foreground/45" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-foreground/45">
                    {p.inviteEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInvite(p.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                >
                  {savingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Редагувати профіль"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Ім’я
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Колір
            </label>
            <Input
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Місячний дохід
            </label>
            <Input
              type="number"
              value={editIncome}
              onChange={(e) => setEditIncome(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleSaveProfile}
            disabled={savingId === editing?.id}
          >
            {savingId === editing?.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Зберегти
          </Button>
        </div>
      </Modal>

      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Запросити до сімейного бюджету"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Ім’я учасника
            </label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Email
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleInvite}
            disabled={savingId === "invite"}
          >
            {savingId === "invite" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
            Створити запрошення
          </Button>
        </div>
      </Modal>
    </div>
  );
}
