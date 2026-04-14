"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

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
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredGroups = search
    ? EMOJI_GROUPS.map((g) => ({
        ...g,
        emojis: g.emojis.filter(() =>
          g.label.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((g) => g.emojis.length > 0)
    : EMOJI_GROUPS;

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger || typeof window === "undefined") return;

      const rect = trigger.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        setPanelStyle({
          left: "50%",
          top: "50%",
          width: "calc(100vw - 24px)",
          maxWidth: "24rem",
          maxHeight: "min(70dvh, 440px)",
          transform: "translate(-50%, -50%)",
        });
        return;
      }

      const panelWidth = 288;
      const panelHeight = 420;
      const sidePadding = 12;
      const spaceBelow = window.innerHeight - rect.bottom - sidePadding;
      const left = Math.min(
        Math.max(rect.left, sidePadding),
        window.innerWidth - panelWidth - sidePadding,
      );
      const top =
        spaceBelow >= panelHeight
          ? rect.bottom + 8
          : Math.max(sidePadding, rect.top - panelHeight - 8);

      setPanelStyle({
        left,
        top,
        width: "18rem",
        maxHeight: "min(70dvh, 440px)",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-card flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all hover:scale-110 active:scale-95 sm:h-12 sm:w-12 sm:text-2xl"
      >
        {value || "📦"}
      </button>

      {typeof document !== "undefined" &&
        open &&
        createPortal(
          <>
            <div
              data-allow-modal-outside="true"
              className="fixed inset-0 pointer-events-auto"
              style={{ zIndex: 100 }}
              onClick={() => setOpen(false)}
            >
              <div className="h-full bg-black/30 sm:bg-transparent" />
            </div>

            <div
              data-allow-modal-outside="true"
              className="fixed pointer-events-auto rounded-2xl border border-white/15 bg-surface p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-surface/95 sm:p-3"
              style={{ ...panelStyle, zIndex: 101 }}
              onClick={(e) => e.stopPropagation()}
              onWheelCapture={(e) => {
                const list = listRef.current;
                if (!list) return;
                list.scrollTop += e.deltaY;
                e.preventDefault();
              }}
            >
              <input
                type="text"
                placeholder="Шукати..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 w-full rounded-xl bg-foreground/5 px-3 py-2.5 text-sm outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-rose-500/30"
              />
              <div
                ref={listRef}
                className="overflow-y-auto overscroll-contain [touch-action:pan-y]"
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
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all hover:bg-foreground/10 sm:h-8 sm:w-8 ${
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
          </>,
          document.body,
        )}
    </div>
  );
}
