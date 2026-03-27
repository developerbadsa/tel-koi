import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ lang: z.enum(["en", "bn"]) });

export async function POST(req: Request) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid lang" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("lang", parse.data.lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
