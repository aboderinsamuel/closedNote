import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
