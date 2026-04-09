"use client";

import { useState } from "react";

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

  const filteredGroups = search
    ? EMOJI_GROUPS.map((g) => ({
        ...g,
        emojis: g.emojis.filter(() =>
          g.label.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((g) => g.emojis.length > 0)
    : EMOJI_GROUPS;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-card flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all hover:scale-110 active:scale-95 sm:h-12 sm:w-12 sm:text-2xl"
      >
        {value || "📦"}
      </button>

      {open && (
        <>
          {/* Full-screen overlay — always clickable to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
            {/* Mobile: dark backdrop, Desktop: transparent */}
            <div className="h-full bg-black/30 sm:bg-transparent" />
          </div>
          {/* Picker dropdown */}
          <div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-24px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-surface p-4 shadow-2xl backdrop-blur-2xl sm:absolute sm:left-0 sm:top-full sm:mt-2 sm:w-72 sm:translate-x-0 sm:translate-y-0 sm:p-3 dark:border-white/10 dark:bg-surface/95"
            style={{ maxHeight: "min(70dvh, 440px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Шукати..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 w-full rounded-xl bg-foreground/5 px-3 py-2.5 text-sm outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-rose-500/30"
            />
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: "min(calc(70dvh - 80px), 360px)" }}
            >
              <div className="space-y-3">
                {filteredGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-0.5 p-0.5">
                      {group.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onChange(emoji);
                            setOpen(false);
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all hover:scale-110 hover:bg-foreground/10 active:scale-95 sm:h-8 sm:w-8 ${
                            value === emoji
                              ? "bg-rose-500/20 ring-2 ring-rose-500/40"
                              : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
