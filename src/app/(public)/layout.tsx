import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader user={user} profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
