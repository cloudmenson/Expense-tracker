"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  LayoutGrid,
  Heart,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { cn, formatMoney } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";
import {
  WISH_STATUS_LABELS,
  type WishItem,
  type WishItemDraft,
  type WishStatus,
} from "@/types/wishlist";

type Filter = "all" | WishStatus;

const FILTERS: { key: Filter; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "Усі", icon: LayoutGrid },
  { key: "wanted", label: WISH_STATUS_LABELS.wanted, icon: Heart },
  { key: "bought", label: WISH_STATUS_LABELS.bought, icon: Check },
];

export function WishlistPage() {
  const { items, hydrate, hydrated, createItem, updateItem, deleteItem } =
    useWishlistStore();
  const { settings } = useExpenseStore();

  const [filter, setFilter] = useState<Filter>("all");
  const [viewing, setViewing] = useState<WishItem | null>(null);
  const [editing, setEditing] = useState<WishItem | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WishItem | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Keep `viewing` in sync after edits (the underlying item may have changed
  // shape) — rebind to the freshly persisted version from the store.
  const viewingFresh = useMemo(
    () => (viewing ? items.find((i) => i.id === viewing.id) ?? null : null),
    [viewing, items],
  );

  const filtered = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) =>
        a.order - b.order || b.createdAt.localeCompare(a.createdAt),
    );
    if (filter === "all") return sorted;
    return sorted.filter((i) => i.status === filter);
  }, [items, filter]);

  const totalShown = useMemo(
    () => filtered.reduce((s, i) => s + (i.price || 0), 0),
    [filtered],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Вішліст
          </h1>
          <p className="mt-1 text-sm text-foreground/55">
            Список бажань — додавай фото, ціну й посилання, познач коли куплено.
          </p>
        </div>
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Додати
        </Button>
      </div>

      {/* Filter chips + total */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="glass-pill inline-flex w-full gap-1 rounded-2xl p-1.5 sm:w-auto">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  active
                    ? "bg-active"
                    : "text-foreground/55 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
              Разом
            </span>
            <span
              className="text-lg font-black tabular-nums sm:text-xl"
              style={{ color: "var(--brand-deep)" }}
            >
              {formatMoney(totalShown, settings.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      {!hydrated ? (
        <div className="glass-card flex min-h-40 items-center justify-center gap-2 rounded-2xl text-sm text-foreground/45">
          <Loader2 className="h-4 w-4 animate-spin" /> Завантаження…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={
            filter === "bought"
              ? "Ще нічого не куплено"
              : "Поки нічого не хочемо"
          }
          description={
            filter === "all"
              ? "Додай першу річ — фото, назва, ціна, опціональне посилання."
              : "Зміни фільтр або додай нову позицію до вішлісту."
          }
          action={{ label: "Додати", onClick: () => setEditing("new") }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <WishCard
              key={item.id}
              item={item}
              currency={settings.currency}
              onView={() => setViewing(item)}
            />
          ))}
        </div>
      )}

      {/* Detail modal (preview) */}
      <Modal
        open={!!viewingFresh}
        onClose={() => setViewing(null)}
        title="Деталі позиції"
        size="md"
      >
        {viewingFresh && (
          <WishDetail
            item={viewingFresh}
            currency={settings.currency}
            onEdit={() => {
              setEditing(viewingFresh);
              setViewing(null);
            }}
            onDelete={() => {
              setPendingDelete(viewingFresh);
              setViewing(null);
            }}
            onPreviewPhoto={setPreviewSrc}
          />
        )}
      </Modal>

      {/* Form modal */}
      {editing && (
        <WishFormModal
          item={editing === "new" ? null : editing}
          currency={settings.currency}
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            if (editing === "new") {
              await createItem(draft);
            } else {
              await updateItem(editing.id, draft);
            }
            setEditing(null);
          }}
        />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteItem(pendingDelete.id);
        }}
        title="Видалити позицію?"
        description={
          pendingDelete
            ? `«${pendingDelete.title}» буде видалено остаточно.`
            : undefined
        }
      />

      <ImageViewerModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}

/* ───────────── Card ───────────── */

function WishCard({
  item,
  currency,
  onView,
}: {
  item: WishItem;
  currency: string;
  onView: () => void;
}) {
  const bought = item.status === "bought";
  return (
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
      className={cn(
        "glass-card group relative flex gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5",
        bought && "opacity-65",
      )}
    >
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "var(--brand-soft)",
          color: "var(--brand-deep)",
        }}
      >
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-7 w-7" />
        )}
      </div>

      <div className="min-w-0 flex-1 pr-9">
        <p
          className={cn(
            "truncate text-base font-semibold",
            bought && "line-through",
          )}
        >
          {item.title}
        </p>
        {item.price > 0 && (
          <p
            className="mt-1 text-xl font-black tabular-nums"
            style={{ color: "var(--brand-deep)" }}
          >
            {formatMoney(item.price, currency)}
          </p>
        )}
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-foreground/55">
            {item.description}
          </p>
        )}
      </div>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Відкрити посилання"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl text-foreground/45 hover:bg-foreground/8 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/* ───────────── Detail (preview) ───────────── */

function WishDetail({
  item,
  currency,
  onEdit,
  onDelete,
  onPreviewPhoto,
}: {
  item: WishItem;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewPhoto: (src: string) => void;
}) {
  const bought = item.status === "bought";

  return (
    <div className="space-y-5">
      {/* Header — photo + title + price */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => item.photo && onPreviewPhoto(item.photo)}
          disabled={!item.photo}
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl disabled:cursor-default sm:h-28 sm:w-28"
          style={{
            backgroundColor: "var(--brand-soft)",
            color: "var(--brand-deep)",
          }}
          aria-label={item.photo ? "Переглянути фото" : undefined}
        >
          {item.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-9 w-9" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-lg font-bold",
              bought && "text-foreground/55 line-through",
            )}
          >
            {item.title}
          </h3>
          {item.price > 0 && (
            <p
              className="mt-1 text-3xl font-black tabular-nums"
              style={{ color: "var(--brand-deep)" }}
            >
              {formatMoney(item.price, currency)}
            </p>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {/* Status */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Статус
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              bought
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-foreground",
            )}
          >
            {WISH_STATUS_LABELS[item.status]}
          </span>
        </div>

        {/* Link */}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-foreground/4"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
              Посилання
            </span>
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground/75">
              <span className="truncate">Відкрити</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </span>
          </a>
        )}

        {/* Description */}
        {item.description && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Опис
            </span>
            <p className="text-sm whitespace-pre-line text-foreground/70">
              {item.description}
            </p>
          </div>
        )}
      </div>

      {/* Edit & Delete */}
      <div className="flex gap-3">
        <Button type="button" onClick={onEdit} className="flex-1">
          <Pencil className="h-4 w-4" />
          Редагувати
        </Button>
        <DeleteIconButton onClick={onDelete} label="Видалити позицію" />
      </div>
    </div>
  );
}

/* ───────────── Form modal ───────────── */

function WishFormModal({
  item,
  currency,
  onClose,
  onSave,
}: {
  item: WishItem | null;
  currency: string;
  onClose: () => void;
  onSave: (draft: WishItemDraft) => Promise<void>;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price ? String(item.price) : "");
  const [photo, setPhoto] = useState(item?.photo ?? "");
  const [link, setLink] = useState(item?.link ?? "");
  const [status, setStatus] = useState<WishStatus>(
    (item?.status as WishStatus) ?? "wanted",
  );
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && !saving;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={item ? "Редагувати позицію" : "Нова позиція"}
      size="md"
    >
      <div className="space-y-4">
        {/* Photo + main fields */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <PhotoUpload
            variant="avatar"
            value={photo}
            onChange={setPhoto}
            aspect={1}
            cropShape="rect"
            outputSize={512}
            cropTitle="Обрізати фото"
          />

          <div className="flex w-full flex-1 flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Назва
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Що саме хочемо"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Ціна ({currency})
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min={0}
                step={0.01}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Опис
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Деталі, розмір, колір…"
            rows={3}
          />
        </div>

        {/* Link (optional) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Посилання
          </label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 field-icon" />
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Status — segmented */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Статус
          </label>
          <div className="glass-pill flex gap-1 rounded-xl p-1.5">
            {(["wanted", "bought"] as const).map((s) => {
              const active = status === s;
              const Icon = s === "wanted" ? Heart : Check;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-active"
                      : "text-foreground/55 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {WISH_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={saving}
        >
          Скасувати
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!canSave}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price) || 0,
                photo,
                link: link.trim(),
                status,
              });
            } finally {
              setSaving(false);
            }
          }}
        >
          {item ? "Зберегти" : "Додати"}
        </Button>
      </div>
    </Modal>
  );
}
