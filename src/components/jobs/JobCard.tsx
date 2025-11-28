"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, User, DollarSign, Heart } from "lucide-react";
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
  const genderLabel = job.preferred_gender === "male" ? "남성" : job.preferred_gender === "female" ? "여성" : "무관";

  return (
    <div className="relative">
      <Link href={`/jobs/${job.id}`}>
        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                <CardDescription className="line-clamp-1 mt-1">
                  {job.center_name}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
                {EXPERIENCE_LEVEL_LABELS[job.experience_level as keyof typeof EXPERIENCE_LEVEL_LABELS]}
              </span>
            </div>

            {/* 성별 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>{genderLabel}</span>
            </div>

            {/* 급여 */}
            {job.salary && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">{job.salary}</span>
              </div>
            )}

            {/* 등록일 */}
            <p className="text-xs text-muted-foreground">
              {new Date(job.created_at).toLocaleDateString("ko-KR")}
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 좋아요 버튼 (절대 위치) */}
      <div className="absolute top-4 right-4 z-10">
        <LikeButton jobId={job.id} userId={userId} initialLiked={false} />
      </div>
    </div>
  );
}
