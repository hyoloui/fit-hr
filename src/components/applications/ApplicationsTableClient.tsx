"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationDetailDialog } from "./ApplicationDetailDialog";

interface Application {
  id: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  resume: {
    id: string;
    title: string;
  } | null;
}

interface ApplicationsTableClientProps {
  applications: Application[];
}

const APPLICATION_STATUS_LABELS = {
  pending: "대기중",
  reviewed: "검토완료",
  accepted: "합격",
  rejected: "불합격",
} as const;

const APPLICATION_STATUS_VARIANTS = {
  pending: "secondary",
  reviewed: "default",
  accepted: "default",
  rejected: "secondary",
} as const;

export function ApplicationsTableClient({ applications }: ApplicationsTableClientProps) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  return (
    <>
      {/* 모바일: 카드 레이아웃 */}
      <div className="block md:hidden space-y-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{application.user?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {application.user?.email || "-"}
                  </p>
                </div>
                <Badge
                  variant={
                    APPLICATION_STATUS_VARIANTS[
                      application.status as keyof typeof APPLICATION_STATUS_VARIANTS
                    ]
                  }
                >
                  {
                    APPLICATION_STATUS_LABELS[
                      application.status as keyof typeof APPLICATION_STATUS_LABELS
                    ]
                  }
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">연락처:</span>
                  <span>{application.user?.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이력서:</span>
                  <span className="truncate ml-2">{application.resume?.title || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">지원일:</span>
                  <span>{new Date(application.created_at).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setSelectedAppId(application.id)}
              >
                상세보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 데스크톱: 테이블 레이아웃 */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>이력서</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>지원일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.user?.name || "-"}</TableCell>
                <TableCell>{application.user?.email || "-"}</TableCell>
                <TableCell>{application.user?.phone || "-"}</TableCell>
                <TableCell>
                  {application.resume ? (
                    <span className="text-sm text-muted-foreground">
                      {application.resume.title}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      APPLICATION_STATUS_VARIANTS[
                        application.status as keyof typeof APPLICATION_STATUS_VARIANTS
                      ]
                    }
                  >
                    {
                      APPLICATION_STATUS_LABELS[
                        application.status as keyof typeof APPLICATION_STATUS_LABELS
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell>{new Date(application.created_at).toLocaleDateString("ko-KR")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppId(application.id)}
                  >
                    상세보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 상세보기 모달 */}
      {selectedAppId && (
        <ApplicationDetailDialog
          applicationId={selectedAppId}
          open={!!selectedAppId}
          onOpenChange={(open) => !open && setSelectedAppId(null)}
        />
      )}
    </>
  );
}
