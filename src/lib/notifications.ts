/** Notification utilities for B4T PWA */

const STORAGE_KEY_ENABLED = "b4t-notif-enabled";
const STORAGE_KEY_BUDGET_MONTH = "b4t-notif-budget-alerted";

export function isNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationsEnabled(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_ENABLED) === "1";
}

export function setNotificationsEnabled(val: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, val ? "1" : "0");
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) return "denied";
  const permission = await Notification.requestPermission();
  return permission;
}

export function getPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationsSupported()) return "unsupported";
  return Notification.permission;
}

async function showNotification(title: string, body: string, tag?: string) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;

  // Prefer SW registration for better PWA support (works when app is not focused)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-96.png",
          tag: tag ?? "b4t",
          data: { url: "/" },
        });
        return;
      }
    } catch {
      // fallthrough to basic Notification
    }
  }

  new Notification(title, { body, icon: "/icons/icon-192.png", tag });
}

/** Show daily reminder if no expenses were logged today */
export async function showDailyReminder(hasExpensesToday: boolean) {
  if (hasExpensesToday) return;
  await showNotification(
    "💸 Не забудьте записати витрати",
    "Сьогодні ще не було жодного запису. Внесіть витрати за день!",
    "b4t-daily",
  );
}

/** Show budget exceeded notification — once per calendar month */
export async function showBudgetExceeded(
  month: string,
  total: number,
  budget: number,
  currency: string,
) {
  const alerted = localStorage.getItem(STORAGE_KEY_BUDGET_MONTH);
  if (alerted === month) return; // already alerted this month
  localStorage.setItem(STORAGE_KEY_BUDGET_MONTH, month);

  const fmt = (n: number) =>
    new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  await showNotification(
    "⚠️ Бюджет перевищено!",
    `Витрати ${fmt(total)} перевищили бюджет ${fmt(budget)} цього місяця.`,
    "b4t-budget",
  );
}

/**
 * Calculate ms until next 23:00 local time.
 * If current time is past 23:00, schedule for tomorrow 23:00.
 */
export function msUntilNextReminder(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}
