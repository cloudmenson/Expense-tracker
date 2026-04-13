import { NextResponse } from "next/server";

const PASSWORD = "iloveyou";
const AUTH_COOKIE = "b4t-love";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (password !== PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Невірний пароль" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Помилка авторизації" },
      { status: 400 },
    );
  }
}
