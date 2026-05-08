"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Pencil, Phone, User as UserIcon } from "lucide-react";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_ROLE_LABELS,
  type Contact,
  type ContactDraft,
  type ContactRole,
} from "@/types/rental";

const ROLE_OPTIONS: ContactRole[] = [
  "landlord",
  "realtor",
  "manager",
  "neighbor",
  "other",
];

export interface ContactsSectionHandle {
  openCreate: () => void;
}

export const ContactsSection = forwardRef<ContactsSectionHandle>(function ContactsSection(_props, ref) {
  const { contacts, createContact, updateContact, deleteContact } =
    useRentalStore();
  const [editing, setEditing] = useState<Contact | "new" | null>(null);
  const [viewing, setViewing] = useState<Contact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    openCreate: () => setEditing("new"),
  }));

  const sorted = [...contacts].sort((a, b) => a.order - b.order);

  // Rebind to the freshest version of the viewed contact whenever the store
  // changes (after edits the underlying object is replaced).
  const viewingFresh = useMemo(
    () => (viewing ? contacts.find((c) => c.id === viewing.id) ?? null : null),
    [viewing, contacts],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/55">
        Контакти, повʼязані з квартирою. Додай скільки потрібно — орендодавець,
        ріелтор, сусід.
      </p>

      {sorted.length === 0 ? (
        <EmptyState
          icon={UserIcon}
          title="Поки жодного контакту"
          description="Додай орендодавця, ріелтора чи будь-кого ще, з ким є справи по квартирі."
          action={{ label: "Додати контакт", onClick: () => setEditing("new") }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              onView={() => setViewing(c)}
            />
          ))}
        </div>
      )}

      {/* Detail (preview) modal */}
      <Modal
        open={!!viewingFresh}
        onClose={() => setViewing(null)}
        title="Контакт"
        size="md"
      >
        {viewingFresh && (
          <ContactDetail
            contact={viewingFresh}
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

      {editing && (
        <ContactFormModal
          contact={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            if (editing === "new") {
              await createContact(draft);
            } else {
              await updateContact(editing.id, draft);
            }
            setEditing(null);
          }}
        />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteContact(pendingDelete.id);
        }}
        title="Видалити контакт?"
        description={
          pendingDelete
            ? `«${pendingDelete.name}» буде видалено остаточно.`
            : undefined
        }
      />

      <ImageViewerModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
});

function ContactCard({
  contact,
  onView,
}: {
  contact: Contact;
  onView: () => void;
}) {
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
        "glass-card group flex gap-4 rounded-2xl p-4",
        "transition-all duration-200 hover:-translate-y-0.5",
      )}
    >
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "var(--brand-soft)",
          color: "var(--brand-deep)",
        }}
      >
        {contact.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contact.photo}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon className="h-7 w-7" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{contact.name}</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
          {CONTACT_ROLE_LABELS[contact.role as ContactRole] ?? contact.role}
        </p>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/75 hover:text-brand-deep"
          >
            <Phone className="h-3.5 w-3.5 field-icon" />
            <span className="tabular-nums">{contact.phone}</span>
          </a>
        )}
        {contact.notes && (
          <p className="mt-2 line-clamp-2 text-xs text-foreground/55">
            {contact.notes}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────── Detail (preview) ───────────── */

function ContactDetail({
  contact,
  onEdit,
  onDelete,
  onPreviewPhoto,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewPhoto: (src: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Header — photo + name + role */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => contact.photo && onPreviewPhoto(contact.photo)}
          disabled={!contact.photo}
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl disabled:cursor-default sm:h-28 sm:w-28"
          style={{
            backgroundColor: "var(--brand-soft)",
            color: "var(--brand-deep)",
          }}
          aria-label={contact.photo ? "Переглянути фото" : undefined}
        >
          {contact.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contact.photo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-9 w-9" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{contact.name}</h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            {CONTACT_ROLE_LABELS[contact.role as ContactRole] ?? contact.role}
          </p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="glass-pill flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-foreground/4"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
              Телефон
            </span>
            <span className="flex items-center gap-2 text-sm font-semibold tabular-nums">
              <Phone className="h-3.5 w-3.5 field-icon" />
              {contact.phone}
            </span>
          </a>
        )}

        {contact.notes && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Нотатки
            </span>
            <p className="text-sm whitespace-pre-line text-foreground/70">
              {contact.notes}
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
        <DeleteIconButton onClick={onDelete} label="Видалити контакт" />
      </div>
    </div>
  );
}

function ContactFormModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Contact | null;
  onClose: () => void;
  onSave: (draft: ContactDraft) => Promise<void>;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [role, setRole] = useState<ContactRole>(
    (contact?.role as ContactRole) ?? "landlord",
  );
  const [photo, setPhoto] = useState(contact?.photo ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={contact ? "Редагувати контакт" : "Новий контакт"}
      size="md"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <PhotoUpload
          variant="avatar"
          value={photo}
          onChange={setPhoto}
          aspect={1}
          cropShape="round"
          outputSize={384}
          cropTitle="Обрізати фото контакту"
        />

        <div className="flex w-full flex-1 flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Імʼя
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Олена Петрівна"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Роль
            </label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as ContactRole)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {CONTACT_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Телефон
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 field-icon" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380 ..."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Нотатки
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Адреса, реквізити, інше"
              rows={3}
            />
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
                name: name.trim(),
                phone: phone.trim(),
                role,
                photo,
                notes: notes.trim(),
              });
            } finally {
              setSaving(false);
            }
          }}
        >
          {contact ? "Зберегти" : "Додати"}
        </Button>
      </div>
    </Modal>
  );
}
