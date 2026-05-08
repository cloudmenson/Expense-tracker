export type WishStatus = "wanted" | "bought";

export const WISH_STATUS_LABELS: Record<WishStatus, string> = {
  wanted: "Хочу",
  bought: "Куплено",
};

export interface WishItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  photo?: string;
  link?: string;
  status: WishStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type WishItemDraft = Omit<
  WishItem,
  "id" | "createdAt" | "updatedAt" | "order"
> & { order?: number };
