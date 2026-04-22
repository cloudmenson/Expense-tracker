"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function UnlockPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        toast(data.error ?? "Невірний пароль", "error");
        return;
      }

      toast("Доступ відкрито", "success");
      router.replace("/");
      router.refresh();
    } catch {
      toast("Не вдалося відкрити застосунок", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Modal
        open
        onClose={() => {}}
        title="Вхід"
        size="lg"
        closeOnOverlay={false}
        closeOnEscape={false}
        tall
      >
        <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl">
            <Image
              src="/images/japan.jpg"
              alt="Рожева троянда"
              width={768}
              height={768}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Budget for Two
                </h1>
                <p className="mt-1 text-sm text-foreground/55">
                  Щоб увійти в застосунок, введіть пароль.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                  Пароль доступу
                </label>
                <div className="relative">
                  <LockKeyhole className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введіть пароль"
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {pending ? "Перевіряємо…" : "Увійти"}
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
