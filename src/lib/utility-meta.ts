import {
  Flame,
  Droplets,
  ShowerHead,
  Zap,
  Wifi,
  Home,
  type LucideIcon,
} from "lucide-react";
import type { UtilityKind } from "@/types/rental";

export const UTILITY_ICON: Record<UtilityKind, LucideIcon> = {
  gas: Flame,
  cold_water: Droplets,
  hot_water: ShowerHead,
  electricity: Zap,
  internet: Wifi,
  rent: Home,
};

export const UTILITY_TINT: Record<UtilityKind, { fg: string; bg: string }> = {
  gas: { fg: "#d97757", bg: "rgba(217, 119, 87, 0.14)" },
  cold_water: { fg: "#5a8db5", bg: "rgba(90, 141, 181, 0.14)" },
  hot_water: { fg: "#c75a4a", bg: "rgba(199, 90, 74, 0.14)" },
  electricity: { fg: "#d99845", bg: "rgba(217, 152, 69, 0.14)" },
  internet: { fg: "#7a8aa3", bg: "rgba(122, 138, 163, 0.14)" },
  rent: { fg: "#8aa17a", bg: "rgba(138, 161, 122, 0.14)" },
};
