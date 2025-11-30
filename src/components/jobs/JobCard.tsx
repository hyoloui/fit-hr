"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, User, DollarSign } from "lucide-react";
import { LikeButton } from "@/components/common/LikeButton";
import { REGION_LABELS } from "@/constants/regions";
import { JOB_CATEGORY_LABELS } from "@/constants/job-categories";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/employment-types";
import { EXPERIENCE_LEVEL_LABELS } from "@/constants/experience-levels";
import type { JobPostingWithDetails } from "@/types";

interface JobCardProps {
  job: JobPostingWithDetails;
  userId: string;
}

export function JobCard({ job, userId }: JobCardProps) {
  const categories = job.categories as string[];
  const genderLabel = job.gender === "male" ? "남성" : job.gender === "female" ? "여성" : "무관";

  // 급여 정보 포맷팅
  const salaryDisplay =
    job.salary_type === "monthly" && job.salary_min && job.salary_max
      ? `월 ${job.salary_min?.toLocaleString()}~${job.salary_max?.toLocaleString()}만원`
      : job.salary_type === "hourly" && job.salary_min
        ? `시급 ${job.salary_min?.toLocaleString()}원`
        : job.salary_type === "negotiable"
          ? "협의"
          : null;

  return (
    <Card className="hover:border-primary transition-colors h-full flex flex-col">
      <Link href={`/jobs/${job.id}`} className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-1">{job.title}</CardTitle>
              <CardDescription className="line-clamp-1 mt-1">{job.center_name}</CardDescription>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton jobId={job.id ?? ""} userId={userId} initialLiked={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          {/* 지역 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {REGION_LABELS[job.region as keyof typeof REGION_LABELS]}
            </span>
          </div>

          {/* 업종 */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {JOB_CATEGORY_LABELS[category as keyof typeof JOB_CATEGORY_LABELS]}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 고용형태 & 경력 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span>
              {EMPLOYMENT_TYPE_LABELS[job.employment_type as keyof typeof EMPLOYMENT_TYPE_LABELS]}
              {" · "}
              {
                EXPERIENCE_LEVEL_LABELS[
                  job.experience_level as keyof typeof EXPERIENCE_LEVEL_LABELS
                ]
              }
            </span>
          </div>

          {/* 성별 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>{genderLabel}</span>
          </div>

          {/* 급여 */}
          {salaryDisplay && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{salaryDisplay}</span>
            </div>
          )}

          {/* 등록일 */}
          <p className="text-xs text-muted-foreground">
            {job.created_at ? new Date(job.created_at).toLocaleDateString("ko-KR") : ""}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
