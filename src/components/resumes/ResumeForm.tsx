"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createResume, updateResume } from "@/actions/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { REGION_OPTIONS } from "@/constants/regions";
import type { Resume } from "@/types";

interface ResumeFormProps {
  mode: "create" | "edit";
  resume?: Resume;
}

interface CareerItem {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface EducationItem {
  school: string;
  major: string;
  period: string;
}

export function ResumeForm({ mode, resume }: ResumeFormProps) {
  const router = useRouter();

  // 초기값 설정
  const initialCareerHistory: CareerItem[] =
    mode === "edit" && resume
      ? (resume.career_history as CareerItem[])
      : [{ company: "", position: "", period: "", description: "" }];

  const initialEducation: EducationItem[] =
    mode === "edit" && resume
      ? (resume.education as EducationItem[])
      : [{ school: "", major: "", period: "" }];

  const [careerHistory, setCareerHistory] = useState<CareerItem[]>(initialCareerHistory);
  const [education, setEducation] = useState<EducationItem[]>(initialEducation);
  const [desiredRegion, setDesiredRegion] = useState(resume?.desired_region || "");

  // Server Action 바인딩
  const action = mode === "create" ? createResume : updateResume.bind(null, resume!.id);
  const [state, formAction, pending] = useActionState(action, null);

  // 경력 추가
  const addCareer = () => {
    setCareerHistory([
      ...careerHistory,
      { company: "", position: "", period: "", description: "" },
    ]);
  };

  // 경력 삭제
  const removeCareer = (index: number) => {
    setCareerHistory(careerHistory.filter((_, i) => i !== index));
  };

  // 경력 수정
  const updateCareer = (index: number, field: keyof CareerItem, value: string) => {
    const updated = [...careerHistory];
    updated[index] = { ...updated[index], [field]: value };
    setCareerHistory(updated);
  };

  // 학력 추가
  const addEducation = () => {
    setEducation([...education, { school: "", major: "", period: "" }]);
  };

  // 학력 삭제
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // 학력 수정
  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">이력서 제목 *</Label>
            <Input
              id="title"
              name="title"
              placeholder="예: 3년차 퍼스널 트레이너"
              defaultValue={resume?.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_position">희망 직무 *</Label>
            <Input
              id="desired_position"
              name="desired_position"
              placeholder="예: 퍼스널 트레이너, 필라테스 강사"
              defaultValue={resume?.desired_position}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_region">희망 지역 *</Label>
            <Select
              name="desired_region"
              value={desiredRegion}
              onValueChange={setDesiredRegion}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_salary">희망 급여</Label>
            <Input
              id="desired_salary"
              name="desired_salary"
              placeholder="예: 월 300만원, 협의 가능"
              defaultValue={resume?.desired_salary || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* 자기소개 */}
      <Card>
        <CardHeader>
          <CardTitle>자기소개</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="introduction"
            placeholder="자기소개를 입력하세요"
            rows={6}
            defaultValue={resume?.introduction || ""}
          />
        </CardContent>
      </Card>

      {/* 경력 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>경력</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addCareer}>
              <Plus className="h-4 w-4 mr-2" />
              경력 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {careerHistory.map((career, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">경력 {index + 1}</h4>
                {careerHistory.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCareer(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <input type="hidden" name={`career_history_${index}_company`} value={career.company} />
              <input
                type="hidden"
                name={`career_history_${index}_position`}
                value={career.position}
              />
              <input type="hidden" name={`career_history_${index}_period`} value={career.period} />
              <input
                type="hidden"
                name={`career_history_${index}_description`}
                value={career.description}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>회사명 *</Label>
                  <Input
                    placeholder="예: ABC 피트니스"
                    value={career.company}
                    onChange={(e) => updateCareer(index, "company", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>직책 *</Label>
                  <Input
                    placeholder="예: 퍼스널 트레이너"
                    value={career.position}
                    onChange={(e) => updateCareer(index, "position", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>근무 기간 *</Label>
                <Input
                  placeholder="예: 2021.01 - 2023.12"
                  value={career.period}
                  onChange={(e) => updateCareer(index, "period", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>업무 내용</Label>
                <Textarea
                  placeholder="담당했던 업무를 입력하세요"
                  rows={3}
                  value={career.description}
                  onChange={(e) => updateCareer(index, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 학력 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>학력</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-2" />
              학력 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">학력 {index + 1}</h4>
                {education.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <input type="hidden" name={`education_${index}_school`} value={edu.school} />
              <input type="hidden" name={`education_${index}_major`} value={edu.major} />
              <input type="hidden" name={`education_${index}_period`} value={edu.period} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>학교명 *</Label>
                  <Input
                    placeholder="예: 한국대학교"
                    value={edu.school}
                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>전공 *</Label>
                  <Input
                    placeholder="예: 체육학"
                    value={edu.major}
                    onChange={(e) => updateEducation(index, "major", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>재학 기간 *</Label>
                <Input
                  placeholder="예: 2017.03 - 2021.02"
                  value={edu.period}
                  onChange={(e) => updateEducation(index, "period", e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 자격증 */}
      <Card>
        <CardHeader>
          <CardTitle>자격증</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="certifications"
            placeholder="보유하신 자격증을 입력하세요 (예: 생활체육지도사 2급, 운동처방사)"
            rows={4}
            defaultValue={resume?.certifications || ""}
          />
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {state?.error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "처리 중..." : mode === "create" ? "등록하기" : "수정하기"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
