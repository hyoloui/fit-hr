"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Send, MessageSquare, Users } from "lucide-react";
import { RecruitmentOfferDialog } from "./RecruitmentOfferDialog";
import { TrainerReviewDialog } from "./TrainerReviewDialog";
import { JOB_CATEGORY_LABELS } from "@/constants/job-categories";
import { EXPERIENCE_LEVEL_LABELS } from "@/constants/experience-levels";
import type { TalentPoolTrainer, JobCategoryCode, ExperienceLevelCode } from "@/types";

interface TrainerTableProps {
  trainers: TalentPoolTrainer[];
}

export function TrainerTable({ trainers }: TrainerTableProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<TalentPoolTrainer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const handleOfferClick = (trainer: TalentPoolTrainer) => {
    setSelectedTrainer(trainer);
    setOfferDialogOpen(true);
  };

  const handleReviewClick = (trainer: TalentPoolTrainer) => {
    setSelectedTrainer(trainer);
    setReviewDialogOpen(true);
  };

  if (trainers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">등록된 트레이너가 없습니다</h3>
          <p className="text-sm text-muted-foreground">검색 조건을 변경해보세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 데스크톱 테이블 */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>업종</TableHead>
              <TableHead>경력</TableHead>
              <TableHead>평균 평점</TableHead>
              <TableHead className="w-[80px]">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer) => (
              <DropdownMenu key={trainer.id}>
                <DropdownMenuTrigger asChild>
                  <TableRow className="cursor-pointer">
                    <TableCell className="font-medium">{trainer.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {trainer.resume?.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {JOB_CATEGORY_LABELS[cat as JobCategoryCode] || cat}
                          </span>
                        ))}
                        {(trainer.resume?.categories.length || 0) > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(trainer.resume?.categories.length || 0) - 3}
                          </span>
                        )}
                        {!trainer.resume && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trainer.resume?.experience_level
                        ? EXPERIENCE_LEVEL_LABELS[
                            trainer.resume.experience_level as ExperienceLevelCode
                          ] || trainer.resume.experience_level
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {trainer.avg_rating !== null ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{trainer.avg_rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({trainer.review_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">클릭</span>
                    </TableCell>
                  </TableRow>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOfferClick(trainer)}>
                    <Send className="h-4 w-4 mr-2" />
                    영입 제안
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReviewClick(trainer)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    평점 남기기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 모바일 카드 목록 */}
      <div className="md:hidden space-y-3">
        {trainers.map((trainer) => (
          <DropdownMenu key={trainer.id}>
            <DropdownMenuTrigger asChild>
              <Card className="cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{trainer.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {trainer.resume?.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {JOB_CATEGORY_LABELS[cat as JobCategoryCode] || cat}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {trainer.resume?.experience_level
                          ? EXPERIENCE_LEVEL_LABELS[
                              trainer.resume.experience_level as ExperienceLevelCode
                            ]
                          : "경력 미등록"}
                      </p>
                    </div>
                    {trainer.avg_rating !== null && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{trainer.avg_rating}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOfferClick(trainer)}>
                <Send className="h-4 w-4 mr-2" />
                영입 제안
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReviewClick(trainer)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                평점 남기기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* 다이얼로그 */}
      {selectedTrainer && (
        <>
          <RecruitmentOfferDialog
            trainerId={selectedTrainer.id}
            trainerName={selectedTrainer.name}
            open={offerDialogOpen}
            onOpenChange={setOfferDialogOpen}
          />
          <TrainerReviewDialog
            trainerId={selectedTrainer.id}
            trainerName={selectedTrainer.name}
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
          />
        </>
      )}
    </>
  );
}
