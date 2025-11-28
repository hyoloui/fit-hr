"use client";

/**
 * 구인공고 폼 컴포넌트
 *
 * @description 구인공고 등록/수정 폼
 * @note 초안 - 추후 업데이트 예정
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createJobPosting, updateJobPosting } from "@/actions/job-posting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { REGION_OPTIONS } from "@/constants/regions";
import { JOB_CATEGORY_OPTIONS } from "@/constants/job-categories";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/constants/employment-types";
import { EXPERIENCE_LEVEL_OPTIONS } from "@/constants/experience-levels";
import { GENDER_LABELS, SALARY_TYPE_LABELS } from "@/constants";
import type { JobPosting } from "@/types";

interface JobPostingFormProps {
  jobPosting?: JobPosting;
}

export function JobPostingForm({ jobPosting }: JobPostingFormProps) {
  const router = useRouter();
  const isEditing = !!jobPosting;

  const action = isEditing ? updateJobPosting.bind(null, jobPosting.id) : createJobPosting;

  const [state, formAction, pending] = useActionState(action, null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    jobPosting?.categories || []
  );

  // 성공 시 토스트 표시 및 리다이렉트
  useEffect(() => {
    if (state?.success) {
      toast.success(isEditing ? "구인공고가 수정되었습니다!" : "구인공고가 등록되었습니다!");
      router.push("/center/jobs");
    }
  }, [state?.success, isEditing, router]);

  // 카테고리 선택 핸들러
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="예: 퍼스널 트레이너 모집"
          required
          disabled={pending}
          defaultValue={jobPosting?.title || ""}
        />
        {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
      </div>

      {/* 지역 */}
      <div className="space-y-2">
        <Label htmlFor="region">지역 *</Label>
        <Select name="region" required defaultValue={jobPosting?.region || ""}>
          <SelectTrigger>
            <SelectValue placeholder="지역을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {REGION_OPTIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.region && <p className="text-sm text-destructive">{state.errors.region[0]}</p>}
      </div>

      {/* 업종 (복수 선택) */}
      <div className="space-y-2">
        <Label>업종 * (복수 선택 가능)</Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {JOB_CATEGORY_OPTIONS.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.value}`}
                name="categories"
                value={category.value}
                checked={selectedCategories.includes(category.value)}
                onCheckedChange={(checked: boolean) =>
                  handleCategoryChange(category.value, checked)
                }
                disabled={pending}
              />
              <label
                htmlFor={`category-${category.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
        {state?.errors?.categories && (
          <p className="text-sm text-destructive">{state.errors.categories[0]}</p>
        )}
      </div>

      {/* 고용형태 */}
      <div className="space-y-2">
        <Label htmlFor="employment_type">고용형태 *</Label>
        <Select
          name="employment_type"
          required
          defaultValue={jobPosting?.employment_type || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="고용형태를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.employment_type && (
          <p className="text-sm text-destructive">{state.errors.employment_type[0]}</p>
        )}
      </div>

      {/* 경력 */}
      <div className="space-y-2">
        <Label htmlFor="experience_level">경력 *</Label>
        <Select
          name="experience_level"
          required
          defaultValue={jobPosting?.experience_level || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="경력을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.experience_level && (
          <p className="text-sm text-destructive">{state.errors.experience_level[0]}</p>
        )}
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <Label htmlFor="gender">성별</Label>
        <Select name="gender" defaultValue={jobPosting?.gender || "any"}>
          <SelectTrigger>
            <SelectValue placeholder="성별을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.gender && <p className="text-sm text-destructive">{state.errors.gender[0]}</p>}
      </div>

      {/* 급여 유형 */}
      <div className="space-y-2">
        <Label htmlFor="salary_type">급여 유형</Label>
        <Select name="salary_type" defaultValue={jobPosting?.salary_type || ""}>
          <SelectTrigger>
            <SelectValue placeholder="급여 유형을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.salary_type && (
          <p className="text-sm text-destructive">{state.errors.salary_type[0]}</p>
        )}
      </div>

      {/* 급여 범위 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salary_min">최소 급여</Label>
          <Input
            id="salary_min"
            name="salary_min"
            type="number"
            min="0"
            placeholder="예: 3000000"
            disabled={pending}
            defaultValue={jobPosting?.salary_min || ""}
          />
          {state?.errors?.salary_min && (
            <p className="text-sm text-destructive">{state.errors.salary_min[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">최대 급여</Label>
          <Input
            id="salary_max"
            name="salary_max"
            type="number"
            min="0"
            placeholder="예: 5000000"
            disabled={pending}
            defaultValue={jobPosting?.salary_max || ""}
          />
          {state?.errors?.salary_max && (
            <p className="text-sm text-destructive">{state.errors.salary_max[0]}</p>
          )}
        </div>
      </div>

      {/* 마감일 */}
      <div className="space-y-2">
        <Label htmlFor="deadline">마감일</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          disabled={pending}
          defaultValue={jobPosting?.deadline || ""}
        />
        {state?.errors?.deadline && (
          <p className="text-sm text-destructive">{state.errors.deadline[0]}</p>
        )}
      </div>

      {/* 상세 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">상세 설명</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="구인공고의 상세 내용을 작성해주세요"
          rows={6}
          disabled={pending}
          defaultValue={jobPosting?.description || ""}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description[0]}</p>
        )}
      </div>

      {/* 전체 에러 메시지 */}
      {state?.errors?._form && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full md:w-auto md:min-w-[120px]"
          onClick={() => router.push("/center/jobs")}
          disabled={pending}
        >
          취소
        </Button>
        <Button type="submit" className="w-full md:w-auto md:min-w-[120px]" disabled={pending}>
          {pending ? "처리 중..." : isEditing ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
