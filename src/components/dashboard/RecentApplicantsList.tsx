import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { RecentApplicant } from "@/actions/dashboard";

interface RecentApplicantsListProps {
  applicants: RecentApplicant[];
}

const statusMap = {
  pending: { label: "대기중", variant: "secondary" as const },
  reviewed: { label: "검토완료", variant: "default" as const },
  accepted: { label: "합격", variant: "default" as const },
  rejected: { label: "불합격", variant: "destructive" as const },
};

export function RecentApplicantsList({ applicants }: RecentApplicantsListProps) {
  if (applicants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 받은 지원</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            아직 받은 지원이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 받은 지원</CardTitle>
        <Link
          href="/center/jobs"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          전체보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div
              key={applicant.id}
              className="p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{applicant.user.name}</h3>
                    <Badge variant={statusMap[applicant.status].variant}>
                      {statusMap[applicant.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{applicant.user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>공고: {applicant.job_posting.title}</span>
                    <span>·</span>
                    <span>이력서: {applicant.resume.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(applicant.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Link
                  href={`/center/jobs/${applicant.job_posting.id}/applications`}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
