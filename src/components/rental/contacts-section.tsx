"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
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
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    openCreate: () => setEditing("new"),
  }));

  const sorted = [...contacts].sort((a, b) => a.order - b.order);

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
              onEdit={() => setEditing(c)}
              onDelete={() => setPendingDelete(c)}
              onPreviewPhoto={setPreviewSrc}
            />
          ))}
        </div>
      )}

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
    <div className="glass-card flex gap-4 rounded-2xl p-4">
      <button
        type="button"
        onClick={() =>
          contact.photo ? onPreviewPhoto(contact.photo) : onEdit()
        }
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
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{contact.name}</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
          {CONTACT_ROLE_LABELS[contact.role as ContactRole] ?? contact.role}
        </p>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
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

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/45 hover:bg-foreground/8 hover:text-foreground"
          aria-label="Редагувати"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <DeleteIconButton variant="ghost" size="md" onClick={onDelete} />
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
