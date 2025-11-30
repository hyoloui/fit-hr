import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { REGION_LABELS } from "@/constants/regions";
import type { Resume, CareerHistory, Education } from "@/types";

interface ResumeDetailViewProps {
  resume: Resume;
}

export function ResumeDetailView({ resume }: ResumeDetailViewProps) {
  const careerHistory = resume.career_history as unknown as CareerHistory[];
  const education = resume.education as unknown as Education[];

  return (
    <div className="space-y-4">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">희망 업종</h4>
            <p>{resume.categories?.join(", ")}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">희망 지역</h4>
            <p>{resume.region ? REGION_LABELS[resume.region as keyof typeof REGION_LABELS] : "-"}</p>
          </div>
          {resume.experience_level && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">경력</h4>
              <p>{resume.experience_level}</p>
            </div>
          )}
          {resume.gender && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">성별</h4>
              <p>
                {resume.gender === "male" ? "남성" : resume.gender === "female" ? "여성" : resume.gender}
              </p>
            </div>
          )}
          {resume.birth_year && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">출생년도</h4>
              <p>{resume.birth_year}년</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 자기소개 */}
      {resume.introduction && (
        <Card>
          <CardHeader>
            <CardTitle>자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{resume.introduction}</p>
          </CardContent>
        </Card>
      )}

      {/* 경력 */}
      {careerHistory && careerHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>경력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {careerHistory.map((career, index) => (
              <div key={index} className="pb-6 border-b last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{career.company}</h4>
                    <p className="text-sm text-muted-foreground">{career.position}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{career.period}</p>
                </div>
                {career.description && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">{career.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 학력 */}
      {education && education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>학력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{edu.school}</h4>
                    <p className="text-sm text-muted-foreground">{edu.major}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 자격증 */}
      {resume.certifications && resume.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>자격증</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {Array.isArray(resume.certifications)
                ? resume.certifications.join(", ")
                : resume.certifications}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
