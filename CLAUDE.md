# Claude Code 개발 가이드라인

> 모든 응답은 **한글**로 작성한다.

---

## 📍 현재 진행 상황

### 완료된 작업

- [x] Next.js 16 + Turbopack 프로젝트 초기화
- [x] Supabase 프로젝트 생성 및 연동
- [x] 환경변수 설정 (Publishable + Secret Key)
- [x] Supabase 클라이언트 설정
  - `src/lib/supabase/client.ts` - 브라우저용
  - `src/lib/supabase/server.ts` - 서버용 (createClient, createAdminClient)
  - `src/lib/supabase/middleware.ts` - 세션 관리
- [x] `proxy.ts` - Next.js 16 미들웨어 (라우트 보호)
- [x] `src/lib/utils.ts` - cn() 유틸
- [x] DB 스키마 설계 및 적용
- [x] RLS 정책 설정 (상수 테이블은 서버 전용)

### 핵심 패턴

- **상수 테이블 조회**: `createAdminClient()` 사용 (secret key)
- **유저 데이터 조회**: `createClient()` 사용 (publishable key + RLS)
- **Server Component 우선**, 상호작용 필요시만 `"use client"`
- **UI 스타일링**: shadcn/ui 사용 및 mobile first 디자인

---

## 📋 앞으로의 Task (MVP)

### Phase 1: 기초 세팅 ✅

#### 1.1 TypeScript 타입 생성 ✅

- [x] `src/types` 폴더 생성
- [x] Supabase 프로젝트 ID 확인 (cbkmxdaduozbfmcystbp)
- [x] 타입 생성 명령어 실행
  ```bash
  npx supabase gen types typescript --project-id cbkmxdaduozbfmcystbp > src/types/database.types.ts
  ```
- [x] `src/types/index.ts` 생성 - 공통 타입 export 및 유틸 타입 정의 ✅
  - ✅ Profile, Center, JobPosting, Resume, Application, Like 타입 (Row, Insert, Update)
  - ✅ 상수 테이블 타입 (Region, JobCategory, EmploymentType, ExperienceLevel)
  - ✅ Enum 타입 (UserRole, Gender, SalaryType, ApplicationStatus)
  - ✅ Code 타입 (RegionCode, JobCategoryCode, EmploymentTypeCode, ExperienceLevelCode)
  - ✅ JSONB 인터페이스 (CareerHistory, Education)
  - ✅ 필터 타입 (JobFilter)

#### 1.2 shadcn/ui 초기화 ✅

- [x] shadcn/ui 초기화 완료
  ```bash
  npx shadcn@latest init
  ```
  - 설정 옵션:
    - Style: Default
    - Base color: Neutral
    - CSS variables: Yes
    - Components: `src/components/ui`

- [x] 필수 의존성 설치 완료
  - `zod` (v4.1.13)
  - `@radix-ui/*` (shadcn/ui가 자동 설치)
  - `class-variance-authority` (v0.7.1)
  - `lucide-react` (v0.555.0)
  - `react-hook-form` (v7.66.1)
  - `@hookform/resolvers` (v5.2.2)
  - `sonner` (v2.0.7)

#### 1.3 shadcn/ui 컴포넌트 추가 ✅

- [x] 필수 컴포넌트 일괄 설치 완료
  ```bash
  npx shadcn@latest add button input card form label select textarea table dialog toast sonner
  ```
- [x] 설치 확인
  - `src/components/ui` 폴더에 11개 컴포넌트 파일 생성 완료
  - `components.json` 설정 완료

#### 1.4 글로벌 레이아웃 구성 ✅

- [x] `src/app/layout.tsx` 개선 완료
  - [x] 메타데이터 업데이트 (title template, description, keywords)
  - [x] 언어 설정 (`lang="ko"`)
  - [x] Toaster 컴포넌트 추가
  - [x] suppressHydrationWarning 추가 (다크모드 대응)
- [x] `src/app/globals.css` 개선 완료
  - [x] shadcn/ui CSS 변수 추가 (HSL 형식)
  - [x] 다크모드 스타일 지원 (.dark 클래스)
  - [x] Tailwind CSS 4 @theme inline 구문 유지

#### 1.5 상수 파일 생성 ✅

- [x] `src/constants/index.ts` - 전역 상수 및 재export (초안)
- [x] `src/constants/regions.ts` - 지역 상수 (초안)
- [x] `src/constants/job-categories.ts` - 업종 상수 (초안)
- [x] `src/constants/employment-types.ts` - 고용형태 상수 (초안)
- [x] `src/constants/experience-levels.ts` - 경력 상수 (초안)
- [x] 모든 상수 파일에 JSDoc 주석 추가 ("초안 - 추후 업데이트 예정")

#### 작업 순서

1. ✅ TypeScript 타입 생성 (1.1)
2. ✅ shadcn/ui 초기화 (1.2)
3. ✅ shadcn/ui 컴포넌트 추가 (1.3)
4. ✅ 글로벌 레이아웃 구성 (1.4)
5. ✅ 상수 파일 생성 (1.5) - 초안 완료

**Phase 1 완료!** 🎉 다음은 Phase 2 (인증 시스템)으로 진행

### Phase 2: 인증 (Auth) ✅

- [x] Auth Server Actions (`src/actions/auth.ts`) ✅
  - [x] `signup()` - 회원가입 (Zod 검증 포함)
  - [x] `login()` - 로그인
  - [x] `logout()` - 로그아웃
  - [x] `getSession()` - 세션 조회
  - [x] `getUserProfile()` - 사용자 프로필 조회
- [x] 인증 페이지 레이아웃 (`src/app/(auth)/layout.tsx`) ✅
- [x] 회원가입 페이지 (`src/app/(auth)/signup/page.tsx`) ✅
  - [x] 역할 선택 (trainer / center) - Select 컴포넌트
  - [x] 이메일, 비밀번호, 이름 입력
  - [x] useActionState 활용한 폼 상태 관리
  - [x] 에러 핸들링 및 성공 시 리다이렉트
- [x] 로그인 페이지 (`src/app/(auth)/login/page.tsx`) ✅
  - [x] 이메일, 비밀번호 입력
  - [x] useActionState 활용한 폼 상태 관리
  - [x] 에러 핸들링 및 성공 시 리다이렉트
- [x] OAuth Callback (`src/app/auth/callback/route.ts`) ✅
  - [x] Code exchange 처리

**Phase 2 완료!** 🎉 다음은 Phase 3 (공통 레이아웃)으로 진행

### Phase 3: 공통 레이아웃 ✅

- [x] 대시보드 레이아웃 (`src/app/(dashboard)/layout.tsx`) ✅
  - [x] 인증 체크 (Supabase Auth)
  - [x] 프로필 정보 조회 (역할 확인)
  - [x] 사이드바 + 헤더 구성
  - [x] 메인 콘텐츠 영역
- [x] 헤더 컴포넌트 (`src/components/layout/Header.tsx`) ✅
  - [x] 사용자 드롭다운 메뉴
  - [x] 아바타 (이름 첫 글자)
  - [x] 로그아웃 기능
  - [x] 프로필 링크
- [x] 사이드바 컴포넌트 (`src/components/layout/Sidebar.tsx`) ✅
  - [x] 역할별 메뉴 아이템
    - 트레이너: 홈, 구인공고, 내 이력서, 지원 내역, 좋아요
    - 센터: 홈, 센터 정보, 구인공고 관리, 공고 등록
  - [x] 활성 메뉴 표시 (usePathname)
  - [x] Lucide React 아이콘
- [x] shadcn/ui 추가 컴포넌트 설치 ✅
  - [x] `dropdown-menu` - 사용자 메뉴
  - [x] `avatar` - 프로필 아바타

**Phase 3 완료!** 🎉 다음은 Phase 4 (센터 기능)로 진행

### Phase 4: 센터 (Center) 기능 ✅

- [x] 센터 정보 등록/수정 (`src/app/(dashboard)/center/profile/page.tsx`) ✅
  - [x] 센터 프로필 폼 컴포넌트 (`CenterProfileForm.tsx`) ✅
  - [x] 센터명, 지역, 주소, 설명, 연락처 입력
  - [x] Promise.all() 병렬 조회로 성능 최적화
  - [x] ROLE_CENTER 상수 사용
- [x] 구인공고 목록 (`src/app/(dashboard)/center/jobs/page.tsx`) ✅
  - [x] 구인공고 카드 형태 표시
  - [x] 활성/비활성 상태 뱃지
  - [x] "지원자 보기", "수정하기" 버튼
  - [x] 빈 상태 처리
- [x] 구인공고 등록 (`src/app/(dashboard)/center/jobs/new/page.tsx`) ✅
  - [x] 구인공고 폼 컴포넌트 (`JobPostingForm.tsx`) ✅
  - [x] 업종 복수 선택 (Checkbox)
  - [x] 지역, 고용형태, 경력, 성별, 급여 입력
  - [x] "← 목록으로" 네비게이션
  - [x] 취소 버튼 → 목록으로 이동
- [x] 구인공고 상세/수정 (`src/app/(dashboard)/center/jobs/[id]/page.tsx`) ✅
  - [x] 구인공고 액션 컴포넌트 (`JobPostingActions.tsx`) ✅
  - [x] 활성화/비활성화 토글
  - [x] 삭제 확인 다이얼로그
  - [x] "← 목록으로", "지원자 목록" 네비게이션
  - [x] Next.js 16 params Promise 처리
- [x] 지원자 목록 조회 (`src/app/(dashboard)/center/jobs/[id]/applications/page.tsx`) ✅
  - [x] 지원자 테이블 (이름, 이메일, 연락처, 이력서, 상태, 지원일)
  - [x] 상태 뱃지 (대기중, 검토완료, 합격, 불합격)
  - [x] "← 목록으로", "공고 수정" 네비게이션
  - [x] 빈 상태 처리
- [x] Server Actions ✅
  - [x] `src/actions/center.ts` - 센터 CRUD
  - [x] `src/actions/job-posting.ts` - 구인공고 CRUD
- [x] shadcn/ui 추가 컴포넌트 ✅
  - [x] `checkbox` - 업종 복수 선택
  - [x] `badge` - 상태 표시

**Phase 4 완료!** 🎉 다음은 Phase 5 (트레이너 기능)로 진행

### Phase 5: 트레이너 (Trainer) 기능

- [ ] 구인공고 목록 (메인) (`src/app/(dashboard)/jobs/page.tsx`)
  - 필터: 지역, 업종, 성별, 고용형태, 경력
  - 좋아요 기능
- [ ] 구인공고 상세 (`src/app/(dashboard)/jobs/[id]/page.tsx`)
  - 지원하기 버튼
- [ ] 이력서 목록 (`src/app/(dashboard)/resumes/page.tsx`)
- [ ] 이력서 등록 (`src/app/(dashboard)/resumes/new/page.tsx`)
- [ ] 이력서 상세/수정 (`src/app/(dashboard)/resumes/[id]/page.tsx`)
- [ ] 지원 내역 (`src/app/(dashboard)/applications/page.tsx`)
- [ ] Server Actions (`src/actions/resume.ts`, `src/actions/application.ts`, `src/actions/like.ts`)

### Phase 6: 공통 컴포넌트

- [ ] 필터 컴포넌트 (`src/components/jobs/JobFilter.tsx`)
- [ ] 공고 카드 (`src/components/jobs/JobCard.tsx`)
- [ ] 이력서 카드 (`src/components/resumes/ResumeCard.tsx`)
- [ ] 좋아요 버튼 (`src/components/common/LikeButton.tsx`)
- [ ] 빈 상태 (`src/components/common/EmptyState.tsx`)

### Phase 7: 마무리

- [ ] 에러 핸들링 (`src/app/error.tsx`, `src/app/not-found.tsx`)
- [ ] 로딩 상태 (`loading.tsx` 파일들)
- [ ] 메타데이터 설정
- [ ] 반응형 UI 점검

### 작업 완료 시 확인 사항

- Task 목록 최신화
- 프로젝트 버전 업데이트
  - `npm version patch`
  - `npm version minor`
  - `npm version major`
- 프로젝트 문서 업데이트
  - README.md 업데이트
  - CLAUDE.md 업데이트
  - `npm run format`
  - `npm run lint`
  - `npm run lint:fix`
  - `npm run type:check`

---

## 🗂️ 최종 폴더 구조 (목표)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── center/
│   │   │   ├── profile/page.tsx
│   │   │   └── jobs/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/
│   │   │           ├── page.tsx
│   │   │           └── applications/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── resumes/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── applications/page.tsx
│   ├── auth/callback/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   └── JobFilter.tsx
│   ├── resumes/
│   │   └── ResumeCard.tsx
│   └── common/
│       ├── LikeButton.tsx
│       └── EmptyState.tsx
├── actions/
│   ├── auth.ts
│   ├── center.ts
│   ├── job-posting.ts
│   ├── resume.ts
│   ├── application.ts
│   └── like.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── types/
│   ├── database.types.ts      # Supabase 생성
│   └── index.ts
└── constants/
    └── index.ts
```

---

## 프로젝트 개요

| 항목       | 값                               |
| ---------- | -------------------------------- |
| 프로젝트   | Fit HR (피트니스 업계 HR 플랫폼) |
| 프레임워크 | Next.js 16 (App Router, SSR)     |
| 언어       | TypeScript (strict)              |
| DB / Auth  | Supabase                         |
| UI         | shadcn/ui + Tailwind CSS         |
| 폼 검증    | Zod                              |
| 코드 품질  | ESLint (Flat Config) + Prettier  |

### 사용하지 않는 것

- ~~Axios~~ → Supabase Client
- ~~React Query~~ → Server Components + Server Actions
- ~~Recoil/Zustand~~ → React Context (필요시만)

---

## Claude Code 작업 규칙

### 작업 전 필수

```
1. 관련 파일 먼저 읽기 (Read before Write)
2. 기존 패턴 파악
3. 불확실하면 질문
```

### 작업 후 체크

```
□ TypeScript 에러 없음
□ ESLint 통과
□ console.log 제거
□ 하드코딩 → 상수화
```

---

## 폴더 구조

```
src/
├── app/
│   ├── (auth)/              # 인증 관련 (login, signup)
│   ├── (dashboard)/         # 인증 필요한 페이지들
│   │   ├── layout.tsx       # 인증 체크 + 사이드바
│   │   └── [feature]/
│   ├── auth/callback/       # Supabase OAuth callback
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   └── [domain]/            # 도메인별 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # 브라우저용 클라이언트
│   │   ├── server.ts        # 서버용 클라이언트
│   │   └── middleware.ts    # 미들웨어용 클라이언트
│   └── utils.ts             # cn() 등 유틸
├── actions/                 # Server Actions
├── types/
│   ├── database.types.ts    # Supabase 생성 타입
│   └── index.ts
└── constants/
```

---

## Supabase 설정

### 클라이언트 생성

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};
```

```ts
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
};
```

---

## 데이터 Fetching 패턴

### Server Component (권장)

```tsx
// app/(dashboard)/users/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>에러: {error.message}</div>;
  }

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Client Component (실시간/상호작용)

```tsx
// components/users/UserList.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 실시간 구독
    const channel = supabase
      .channel("users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
        // 실시간 업데이트 처리
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{/* 렌더링 */}</div>;
};
```

---

## Server Actions 패턴

### 기본 구조

```ts
// src/actions/user.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1, "이름 필수"),
  email: z.string().email("올바른 이메일 형식"),
});

export async function createUser(formData: FormData) {
  const supabase = await createClient();

  const validated = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("users").insert(validated.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  return { success: true };
}
```

### Form에서 사용

```tsx
// components/users/CreateUserForm.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CreateUserForm = () => {
  const [state, action, pending] = useActionState(createUser, null);

  return (
    <form action={action} className="space-y-4">
      <Input name="name" placeholder="이름" />
      {state?.error?.name && <p className="text-sm text-destructive">{state.error.name}</p>}

      <Input name="email" type="email" placeholder="이메일" />
      {state?.error?.email && <p className="text-sm text-destructive">{state.error.email}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "처리 중..." : "생성"}
      </Button>
    </form>
  );
};
```

---

## 인증 패턴

### 로그인 Action

```ts
// src/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

### 인증 체크 (Layout)

```tsx
// app/(dashboard)/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

### Middleware

```ts
// middleware.ts (또는 proxy.ts in Next.js 16)
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

---

## shadcn/ui 사용

### 컴포넌트 추가

```bash
npx shadcn@latest add button input card table dialog form label
```

### 사용 예시

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
```

---

## 컴포넌트 템플릿

### Page (Server Component)

```tsx
// app/(dashboard)/[feature]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { FeatureList } from "@/components/feature/FeatureList";
import { CreateButton } from "@/components/feature/CreateButton";

export default async function FeaturePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("features").select("*");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">기능 목록</h1>
        <CreateButton />
      </div>
      <FeatureList data={data ?? []} />
    </div>
  );
}
```

### Client Component

```tsx
// components/feature/FeatureList.tsx
"use client";

import { useState } from "react";
import type { Feature } from "@/types";

interface FeatureListProps {
  data: Feature[];
}

export const FeatureList = ({ data }: FeatureListProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  return <div>{/* 구현 */}</div>;
};
```

---

## TypeScript 규칙

```ts
// ✅ interface 사용
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Supabase 생성 타입 활용
import type { Database } from "@/types/database.types";
type User = Database["public"]["Tables"]["users"]["Row"];
type InsertUser = Database["public"]["Tables"]["users"]["Insert"];
```

### Supabase 타입 생성

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

---

## 명명 규칙

| 대상          | 규칙                 | 예시            |
| ------------- | -------------------- | --------------- |
| 컴포넌트      | PascalCase           | `UserCard.tsx`  |
| Server Action | camelCase            | `createUser.ts` |
| 유틸 함수     | camelCase            | `formatDate.ts` |
| 상수          | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |

---

## Import 순서

```ts
// 1. React/Next.js
import { Suspense } from "react";
import Link from "next/link";

// 2. 서드파티
import { z } from "zod";

// 3. 내부 (@/)
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

// 4. 상대 경로
import { helper } from "./helper";
```

---

## 금지 사항

```
❌ any 타입
❌ console.log 커밋
❌ 인라인 스타일 (style={{}})
❌ 클래스 컴포넌트
❌ Client Component에서 직접 DB 수정 (Server Action 사용)
❌ 200줄 초과 컴포넌트
```

---

## 자주 쓰는 명령어

```bash
# 개발
npm run dev

# 빌드 & 타입체크
npm run build
npm run lint
npm run lint:fix

# shadcn 컴포넌트 추가
npx shadcn@latest add [component]

# Supabase 타입 생성
npx supabase gen types typescript --project-id ID > src/types/database.types.ts
```
