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
import { profileAvatarFallback } from "@/lib/utils";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
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
  // Crop modal
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const isBusy = savingId !== null;

  const activeProfiles = useMemo(
    () => profiles.filter((p) => p.status === "active"),
    [profiles],
  );
  const invitedProfiles = useMemo(
    () => profiles.filter((p) => p.status === "invited"),
    [profiles],
  );

  const getProfileAvatarImage = useCallback(
    (profile: Profile) => {
      if (profile.avatarImage) return profile.avatarImage;
      if (profile.id === "person1") return settings.person1AvatarImage;
      if (profile.id === "person2") return settings.person2AvatarImage;
      return undefined;
    },
    [settings.person1AvatarImage, settings.person2AvatarImage],
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
    setEditAvatarImage(getProfileAvatarImage(p));
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
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

    // Read raw data URL and open crop modal
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (isBusy) return;
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
    if (isBusy) return;
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
    if (isBusy) return;
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
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-32 animate-pulse rounded-xl bg-foreground/8" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-foreground/5" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-xl bg-foreground/8" />
        </div>
        {/* Cards skeleton */}
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-foreground/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded-lg bg-foreground/8" />
                  <div className="h-3 w-16 animate-pulse rounded-lg bg-foreground/5" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded-lg bg-foreground/8" />
              </div>
            </div>
          ))}
        </div>
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
        <Button
          type="button"
          onClick={() => setShowInvite(true)}
          disabled={isBusy}
        >
          <Plus className="h-4 w-4" /> Запросити
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activeProfiles.map((p) => {
          const avatarImage = getProfileAvatarImage(p);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => openEdit(p)}
              disabled={isBusy}
              className="glass-card rounded-xl p-4 text-left transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg"
                  style={{ backgroundColor: `${p.color}22`, color: p.color }}
                >
                  {avatarImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarImage}
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
          );
        })}
      </div>

      {invitedProfiles.length > 0 && (
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold">Очікують запрошення</h2>
          <div className="space-y-2">
            {invitedProfiles.map((p) => (
              <div
                key={p.id}
                className="glass-pill flex items-center gap-3 rounded-xl px-3 py-2"
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
                  disabled={isBusy}
                  className="glass-pill flex h-8 w-8 items-center justify-center rounded-xl text-foreground/35 transition-colors hover:bg-rose-500/12 hover:text-rose-500"
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
        <div className="space-y-5">
          {/* Avatar hero */}
          <div className="relative flex flex-col items-center pb-1 pt-2">
            {/* colour glow */}
            <div
              className="absolute top-0 h-32 w-32 rounded-full opacity-25 blur-3xl"
              style={{ backgroundColor: editColor }}
            />

            <div className="relative z-10">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white shadow-lg ring-4 ring-background"
                style={{ backgroundColor: editColor }}
              >
                {editAvatarImage ? (
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

              {/* Camera icon */}
              <label className="absolute bottom-0 right-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl bg-foreground text-background shadow-md transition-transform hover:scale-110 active:scale-95">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isBusy}
                  onChange={handleAvatarUpload}
                />
                <Upload className="h-3.5 w-3.5" />
              </label>
            </div>

            {editAvatarImage && (
              <button
                type="button"
                onClick={() => setEditAvatarImage(undefined)}
                disabled={isBusy}
                className="mt-3 text-xs text-foreground/35 transition-colors hover:text-rose-500"
              >
                Прибрати фото
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Ім’я
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isBusy}
            />
          </div>

          {/* Colour */}
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
                    disabled={isBusy}
                    className="relative h-10 rounded-[10px] transition-transform hover:scale-[1.06] active:scale-95"
                    style={{ backgroundColor: color }}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-[10px] ring-2 ring-white/60 ring-offset-2 ring-offset-background" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Income */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Місячний дохід
            </label>
            <Input
              type="number"
              value={editIncome}
              onChange={(e) => setEditIncome(parseInt(e.target.value) || 0)}
              min={0}
              disabled={isBusy}
            />
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleSaveProfile}
            disabled={isBusy}
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

      {cropSrc && (
        <ImageCropModal
          open={!!cropSrc}
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={(dataUrl) => {
            setEditAvatarImage(dataUrl);
            setCropSrc(null);
          }}
        />
      )}

      <Modal
        open={showInvite}
        onClose={() => {
          if (isBusy) return;
          setShowInvite(false);
        }}
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
              disabled={isBusy}
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
              disabled={isBusy}
            />
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleInvite}
            disabled={isBusy}
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
