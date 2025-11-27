# Claude Code 개발 가이드라인

> 모든 응답은 **한글**로 작성한다.

## 프로젝트 개요

| 항목       | 값                              |
| ---------- | ------------------------------- |
| 프로젝트   | Fit HR                          |
| 프레임워크 | Next.js 16 (App Router, SSR)    |
| 언어       | TypeScript (strict)             |
| DB / Auth  | Supabase                        |
| UI         | shadcn/ui + Tailwind CSS        |
| 폼 검증    | Zod                             |
| 코드 품질  | ESLint (Flat Config) + Prettier |

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          // 실시간 업데이트 처리
        }
      )
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
      {state?.error?.name && (
        <p className="text-sm text-destructive">{state.error.name}</p>
      )}

      <Input name="email" type="email" placeholder="이메일" />
      {state?.error?.email && (
        <p className="text-sm text-destructive">{state.error.email}</p>
      )}

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

interface Props {
  children: React.ReactNode;
}
export default async function DashboardLayout({ children }: Props) {
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

- next.js 16 에서는 middleware.ts 대신 proxy.ts 를 사용한다.

```ts
//  proxy.ts in Next.js 16
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
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

- 최적의 react hook 활용하여 코드 작성

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
❌ 300줄 초과 컴포넌트
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
