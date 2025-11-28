"use client";

/**
 * 센터 정보 폼 컴포넌트
 *
 * @description 센터 정보 등록/수정 폼
 * @note 초안 - 추후 업데이트 예정
 */

import { useActionState, useEffect } from "react";
import { createCenter, updateCenter } from "@/actions/center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { REGION_OPTIONS } from "@/constants/regions";
import type { Center } from "@/types";

interface CenterProfileFormProps {
  center: Center | null;
}

export function CenterProfileForm({ center }: CenterProfileFormProps) {
  const isEditing = !!center;

  const action = isEditing
    ? updateCenter.bind(null, center.id)
    : createCenter;

  const [state, formAction, pending] = useActionState(action, null);

  // 성공 시 토스트 표시
  useEffect(() => {
    if (state?.success) {
      toast.success(isEditing ? "센터 정보가 수정되었습니다!" : "센터 정보가 등록되었습니다!");
    }
  }, [state?.success, isEditing]);

  return (
    <form action={formAction} className="space-y-6">
      {/* 센터명 */}
      <div className="space-y-2">
        <Label htmlFor="name">센터명 *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="피트니스 센터"
          required
          disabled={pending}
          defaultValue={center?.name || ""}
        />
        {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>

      {/* 지역 */}
      <div className="space-y-2">
        <Label htmlFor="region">지역 *</Label>
        <Select name="region" required defaultValue={center?.region || ""}>
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

      {/* 주소 */}
      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="서울시 강남구 ..."
          disabled={pending}
          defaultValue={center?.address || ""}
        />
        {state?.errors?.address && <p className="text-sm text-destructive">{state.errors.address[0]}</p>}
      </div>

      {/* 센터 소개 */}
      <div className="space-y-2">
        <Label htmlFor="description">센터 소개</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="센터에 대한 간단한 소개를 작성해주세요"
          rows={4}
          disabled={pending}
          defaultValue={center?.description || ""}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description[0]}</p>
        )}
      </div>

      {/* 연락처 이메일 */}
      <div className="space-y-2">
        <Label htmlFor="contact_email">연락처 이메일</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          placeholder="center@example.com"
          disabled={pending}
          defaultValue={center?.contact_email || ""}
        />
        {state?.errors?.contact_email && (
          <p className="text-sm text-destructive">{state.errors.contact_email[0]}</p>
        )}
      </div>

      {/* 연락처 전화번호 */}
      <div className="space-y-2">
        <Label htmlFor="contact_phone">연락처 전화번호</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          placeholder="010-1234-5678"
          disabled={pending}
          defaultValue={center?.contact_phone || ""}
        />
        {state?.errors?.contact_phone && (
          <p className="text-sm text-destructive">{state.errors.contact_phone[0]}</p>
        )}
      </div>

      {/* 로고 URL */}
      <div className="space-y-2">
        <Label htmlFor="logo_url">로고 URL</Label>
        <Input
          id="logo_url"
          name="logo_url"
          type="url"
          placeholder="https://example.com/logo.png"
          disabled={pending}
          defaultValue={center?.logo_url || ""}
        />
        {state?.errors?.logo_url && <p className="text-sm text-destructive">{state.errors.logo_url[0]}</p>}
        <p className="text-xs text-muted-foreground">
          로고 이미지의 URL을 입력해주세요 (추후 업로드 기능 추가 예정)
        </p>
      </div>

      {/* 전체 에러 메시지 */}
      {state?.errors?._form && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "처리 중..." : isEditing ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
