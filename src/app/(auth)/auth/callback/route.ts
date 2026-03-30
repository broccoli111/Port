import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if client record exists; create if not
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!existingClient) {
          await supabase.from("clients").insert({ user_id: user.id });
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
