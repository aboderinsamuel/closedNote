import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/supabase-server";

function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("prompt_versions")
    .select("*")
    .eq("prompt_id", params.id)
    .order("version_number", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const versions = (data ?? []).map((v) => ({
    id: v.id,
    promptId: v.prompt_id,
    title: v.title,
    content: v.content,
    versionNumber: v.version_number,
    createdAt: v.created_at,
  }));

  return NextResponse.json(versions);
}
