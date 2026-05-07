"use client";

import { useState } from "react";
import { ArrowLeft, Package, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Їжа та напої",
    emojis: [
      "🛒",
      "🍎",
      "🍕",
      "🍔",
      "🍣",
      "🥗",
      "🍰",
      "🍩",
      "☕",
      "🍺",
      "🥤",
      "🍷",
      "🧁",
      "🥐",
      "🍗",
      "🥩",
      "🧀",
      "🥚",
      "🍇",
      "🍓",
      "🍑",
      "🥑",
      "🌽",
      "🥕",
    ],
  },
  {
    label: "Транспорт",
    emojis: [
      "🚗",
      "🚕",
      "🚌",
      "🚇",
      "✈️",
      "🚀",
      "🛵",
      "🚲",
      "⛽",
      "🅿️",
      "🛻",
      "🚢",
      "🚁",
      "🛶",
    ],
  },
  {
    label: "Дім",
    emojis: [
      "🏠",
      "🛋️",
      "🧹",
      "💡",
      "🛁",
      "🪴",
      "🔑",
      "🏡",
      "🏗️",
      "🪟",
      "🚪",
      "🧺",
      "🛏️",
      "🪑",
    ],
  },
  {
    label: "Здоров'я",
    emojis: [
      "💊",
      "🏥",
      "🩺",
      "🧬",
      "💉",
      "🩹",
      "🧘",
      "❤️‍🩹",
      "🦷",
      "👁️",
      "🩻",
      "🧪",
    ],
  },
  {
    label: "Розваги",
    emojis: [
      "🎬",
      "🎮",
      "🎵",
      "🎭",
      "🎪",
      "🎯",
      "🎲",
      "🎸",
      "📺",
      "🎤",
      "🎧",
      "🎨",
      "📷",
      "🎳",
    ],
  },
  {
    label: "Покупки",
    emojis: [
      "👗",
      "👟",
      "👜",
      "💍",
      "🎁",
      "🧥",
      "👒",
      "🕶️",
      "💄",
      "🧴",
      "👠",
      "🩴",
      "🧤",
      "👔",
    ],
  },
  {
    label: "Фінанси",
    emojis: [
      "💰",
      "💳",
      "🏦",
      "📊",
      "💵",
      "🪙",
      "📈",
      "💸",
      "🤑",
      "🧾",
      "📉",
      "🏧",
    ],
  },
  {
    label: "Природа",
    emojis: [
      "🌿",
      "🌸",
      "🌻",
      "🐾",
      "🌙",
      "☀️",
      "🌈",
      "❄️",
      "🍃",
      "🌊",
      "🦋",
      "🐝",
    ],
  },
  {
    label: "Обличчя",
    emojis: [
      "😊",
      "😍",
      "🤔",
      "😢",
      "😎",
      "🤩",
      "🥳",
      "😴",
      "🤗",
      "😋",
      "🫡",
      "🥺",
      "😤",
      "🫠",
    ],
  },
  {
    label: "Символи",
    emojis: [
      "⭐",
      "❤️",
      "✅",
      "❌",
      "⚡",
      "🔥",
      "💎",
      "🌟",
      "🎯",
      "🏆",
      "🔔",
      "📌",
      "✨",
      "💫",
    ],
  },
];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filteredGroups = q
    ? EMOJI_GROUPS.map((g) => ({
        ...g,
        emojis: g.label.toLowerCase().includes(q) ? g.emojis : [],
      })).filter((g) => g.emojis.length > 0)
    : EMOJI_GROUPS;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setOpen(true);
        }}
        className="glass-pill flex h-11 w-11 items-center justify-center rounded-xl text-xl active:scale-95 sm:h-12 sm:w-12 sm:text-2xl"
        aria-label="Обрати іконку"
      >
        {value ? <span>{value}</span> : <Package className="h-5 w-5 text-foreground/55" />}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Оберіть іконку"
        size="md"
        maxHeight="50dvh"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Назад"
              className="glass-pill flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 field-icon" />
              <Input
                type="text"
                placeholder="Пошук категорії…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                autoFocus={false}
              />
            </div>
          </div>

          <div className="space-y-4 pb-2">
            {filteredGroups.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/45">
                Нічого не знайдено
              </p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-8">
                    {group.emojis.map((emoji) => {
                      const selected = value === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onChange(emoji);
                            setOpen(false);
                          }}
                          className={`flex aspect-square w-full items-center justify-center rounded-lg text-xl active:scale-95 ${
                            selected
                              ? "bg-active"
                              : "hover:bg-foreground/8"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
