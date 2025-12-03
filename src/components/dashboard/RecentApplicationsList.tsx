import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { RecentApplication } from "@/actions/dashboard";

interface RecentApplicationsListProps {
  applications: RecentApplication[];
}

const statusMap = {
  pending: { label: "대기중", variant: "secondary" as const },
  reviewed: { label: "검토완료", variant: "default" as const },
  accepted: { label: "합격", variant: "default" as const },
  rejected: { label: "불합격", variant: "destructive" as const },
};

export function RecentApplicationsList({ applications }: RecentApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 지원 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            아직 지원한 공고가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 지원 내역</CardTitle>
        <Link
          href="/applications"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          전체보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
            <Link
              key={application.id}
              href={`/jobs/${application.job_posting.id}`}
              className="block p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{application.job_posting.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.job_posting.center.name} · {application.job_posting.region}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(application.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Badge variant={statusMap[application.status].variant}>
                  {statusMap[application.status].label}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
