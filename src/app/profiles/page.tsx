"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  Plus,
  Save,
  Loader2,
  UserRound,
  Mail,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenseStore } from "@/lib/store";
import * as api from "@/lib/api-client";
import { imageFileToDataUrl, profileAvatarFallback } from "@/lib/utils";
import type { Profile } from "@/types/profile";

const AVATAR_COLORS = [
  "#e11d48",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export default function ProfilesPage() {
  const { toast } = useToast();
  const { settings, _patchSettings } = useExpenseStore();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editing, setEditing] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#e11d48");
  const [editIncome, setEditIncome] = useState(0);
  // Stores the final data: URL (or undefined) — sent directly to the server on save
  const [editAvatarImage, setEditAvatarImage] = useState<string | undefined>();
  const [avatarConverting, setAvatarConverting] = useState(false);

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

  const loadProfiles = useCallback(async () => {
    try {
      const result = await api.fetchProfiles();
      setProfiles(result);
    } catch {
      toast("Не вдалося завантажити профілі", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const openEdit = (p: Profile) => {
    setEditing(p);
    setEditName(p.name);
    setEditColor(p.color);
    setEditIncome(p.monthlyIncome);
    setEditAvatarImage(p.avatarImage || undefined);
    setAvatarConverting(false);
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Оберіть файл зображення", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Зображення має бути до 5 МБ", "error");
      return;
    }

    setAvatarConverting(true);
    try {
      const dataUrl = await imageFileToDataUrl(file);
      setEditAvatarImage(dataUrl);
    } catch {
      toast("Не вдалося обробити зображення", "error");
    } finally {
      setAvatarConverting(false);
    }
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
      const saved = await api.updateProfile(editing.id, {
        name,
        color: editColor,
        monthlyIncome: editIncome,
        avatarImage: editAvatarImage ?? "",
      });

      setProfiles((prev) => prev.map((p) => (p.id === editing.id ? saved : p)));

      // Sync Zustand settings immediately for the two core profiles
      if (editing.id === "person1") {
        _patchSettings({
          person1Name: saved.name,
          person1Color: saved.color,
          person1Income: saved.monthlyIncome,
          person1AvatarImage: saved.avatarImage ?? undefined,
        });
      } else if (editing.id === "person2") {
        _patchSettings({
          person2Name: saved.name,
          person2Color: saved.color,
          person2Income: saved.monthlyIncome,
          person2AvatarImage: saved.avatarImage ?? undefined,
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
      await api.createProfile({
        name,
        inviteEmail: email,
        status: "invited",
        role: "member",
        color: "#6366f1",
        monthlyIncome: 0,
      });
      await loadProfiles();
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
      await loadProfiles();
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
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg"
                style={{ backgroundColor: `${p.color}22`, color: p.color }}
              >
                {p.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatarImage}
                    alt={p.name}
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  profileAvatarFallback(p.name, p.avatarEmoji)
                )}
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
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-foreground/3 px-4 py-5">
            <div
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white"
              style={{ backgroundColor: editColor }}
            >
              {avatarConverting ? (
                <Loader2 className="h-8 w-8 animate-spin opacity-50" />
              ) : editAvatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editAvatarImage}
                  alt={editName || editing?.name || "avatar"}
                  className="h-24 w-24 object-cover"
                />
              ) : (
                profileAvatarFallback(
                  editName || editing?.name || "",
                  editing?.avatarEmoji,
                )
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <span className="btn-secondary flex w-full cursor-pointer items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Завантажити аватар
                </span>
              </label>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => setEditAvatarImage(undefined)}
                disabled={!editAvatarImage}
              >
                <Trash2 className="h-4 w-4" />
                Прибрати фото
              </Button>
            </div>
          </div>
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
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_COLORS.map((color) => {
                const active = editColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Обрати колір ${color}`}
                    onClick={() => setEditColor(color)}
                    className={`h-11 rounded-2xl border transition-transform hover:scale-[1.03] ${
                      active
                        ? "border-foreground/20 ring-2 ring-rose-500/35"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
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
            disabled={savingId === editing?.id || avatarConverting}
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
