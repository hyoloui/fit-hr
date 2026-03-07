"use client";

import { useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { updateOfferStatus } from "@/actions/recruitment-offer";
import type { ReceivedOffer } from "@/types";

interface ReceivedOfferListProps {
  offers: ReceivedOffer[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  accepted: "수락",
  rejected: "거절",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
};

export function ReceivedOfferList({ offers }: ReceivedOfferListProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (offerId: string, status: "accepted" | "rejected") => {
    startTransition(async () => {
      const result = await updateOfferStatus(offerId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(status === "accepted" ? "제안을 수락했습니다." : "제안을 거절했습니다.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="line-clamp-1">{offer.job_posting?.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {offer.center?.name}
                </CardDescription>
              </div>
              <Badge variant={STATUS_VARIANTS[offer.status]}>
                {STATUS_LABELS[offer.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {offer.center?.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{offer.center.address}</span>
              </div>
            )}

            {offer.message && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 mt-0.5" />
                <span>{offer.message}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {offer.created_at
                  ? new Date(offer.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </span>
            </div>

            {offer.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(offer.id, "accepted")}
                  disabled={isPending}
                >
                  수락
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(offer.id, "rejected")}
                  disabled={isPending}
                >
                  거절
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
