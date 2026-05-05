export type UtilityKind =
  | "gas"
  | "cold_water"
  | "hot_water"
  | "electricity"
  | "internet"
  | "rent";

export const UTILITY_LABELS: Record<UtilityKind, string> = {
  gas: "Газ",
  cold_water: "Холодна вода",
  hot_water: "Гаряча вода",
  electricity: "Електрика",
  internet: "Інтернет",
  rent: "Квартплата",
};

export const METERED_KINDS: UtilityKind[] = [
  "gas",
  "cold_water",
  "hot_water",
  "electricity",
];

export const FIXED_KINDS: UtilityKind[] = ["internet", "rent"];

export type ContactRole =
  | "landlord"
  | "realtor"
  | "neighbor"
  | "manager"
  | "other";

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  landlord: "Орендодавець",
  realtor: "Ріелтор",
  neighbor: "Сусід",
  manager: "Управитель",
  other: "Інший",
};

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  photo?: string;
  role: ContactRole;
  notes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ContactDraft = Omit<
  Contact,
  "id" | "createdAt" | "updatedAt" | "order"
> & { order?: number };

export interface RentReading {
  kind: UtilityKind | string;
  previous: number;
  current: number;
  photo?: string;
}

export interface RentMonth {
  id: string;
  month: string;
  rentAmount: number;
  invoicePhoto?: string;
  charged?: number;
  paid?: number;
  paidAt?: string;
  readings: RentReading[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalBootstrap {
  contacts: Contact[];
  months: RentMonth[];
}
