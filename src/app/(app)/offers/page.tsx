import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReceivedOffers } from "@/actions/recruitment-offer";
import { ReceivedOfferList } from "@/components/offers/ReceivedOfferList";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

export const metadata = {
  title: "받은 제안",
  description: "센터로부터 받은 영입 제안 목록",
};

export default async function OffersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getReceivedOffers();
  const offers = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">받은 제안</h1>
        <p className="text-sm text-muted-foreground mt-1">
          센터로부터 받은 영입 제안을 확인하세요
        </p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">받은 제안이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              센터에서 영입 제안을 보내면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <ReceivedOfferList offers={offers} />
      )}
    </div>
  );
}
