import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default async function AppPublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: PublicHeader 레이아웃
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader user={null} profile={null} />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // 로그인: Sidebar + Header 레이아웃
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  const hasCenter = !!center;

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar profile={profile!} hasCenter={hasCenter} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} profile={profile!} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 pt-16 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
