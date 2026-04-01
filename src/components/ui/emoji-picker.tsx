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
        className="glass-card flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all hover:scale-110 active:scale-95"
      >
        {value || "📦"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/15 bg-surface/90 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10">
            <input
              type="text"
              placeholder="Поиск категории..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 w-full rounded-xl bg-foreground/5 px-3 py-2 text-sm outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="max-h-60 space-y-3 overflow-y-auto">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onChange(emoji);
                          setOpen(false);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:scale-125 hover:bg-foreground/10 ${
                          value === emoji
                            ? "bg-emerald-500/20 ring-2 ring-emerald-500/40"
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
        </>
      )}
    </div>
  );
}
