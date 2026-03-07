# 인재풀 기능 - Supabase SQL

Supabase SQL Editor에서 순서대로 실행하세요.

---

## 1. 테이블 생성

```sql
-- 영입 제안 테이블
CREATE TABLE recruitment_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 트레이너 리뷰 테이블
CREATE TABLE trainer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 트레이너 좋아요 테이블 (TODO)
CREATE TABLE trainer_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(center_id, trainer_id)
);
```

## 2. 인덱스 생성

```sql
-- recruitment_offers 인덱스
CREATE INDEX idx_recruitment_offers_center_id ON recruitment_offers(center_id);
CREATE INDEX idx_recruitment_offers_trainer_id ON recruitment_offers(trainer_id);
CREATE INDEX idx_recruitment_offers_status ON recruitment_offers(status);

-- trainer_reviews 인덱스
CREATE INDEX idx_trainer_reviews_trainer_id ON trainer_reviews(trainer_id);
CREATE INDEX idx_trainer_reviews_center_id ON trainer_reviews(center_id);

-- trainer_likes 인덱스
CREATE INDEX idx_trainer_likes_center_id ON trainer_likes(center_id);
CREATE INDEX idx_trainer_likes_trainer_id ON trainer_likes(trainer_id);
```

## 3. RLS 정책

```sql
-- recruitment_offers RLS
ALTER TABLE recruitment_offers ENABLE ROW LEVEL SECURITY;

-- 센터 소유자: 자신의 센터 제안 조회/생성
CREATE POLICY "센터 소유자는 자신의 제안을 조회할 수 있다"
  ON recruitment_offers FOR SELECT
  USING (
    center_id IN (SELECT id FROM centers WHERE owner_id = auth.uid())
    OR trainer_id = auth.uid()
  );

CREATE POLICY "센터 소유자는 제안을 생성할 수 있다"
  ON recruitment_offers FOR INSERT
  WITH CHECK (
    center_id IN (SELECT id FROM centers WHERE owner_id = auth.uid())
  );

-- 트레이너: 자신에게 온 제안 상태 변경
CREATE POLICY "트레이너는 자신의 제안 상태를 변경할 수 있다"
  ON recruitment_offers FOR UPDATE
  USING (trainer_id = auth.uid());

-- trainer_reviews RLS
ALTER TABLE trainer_reviews ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자: 리뷰 조회
CREATE POLICY "인증 사용자는 리뷰를 조회할 수 있다"
  ON trainer_reviews FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 센터 소유자: 리뷰 작성
CREATE POLICY "센터 소유자는 리뷰를 작성할 수 있다"
  ON trainer_reviews FOR INSERT
  WITH CHECK (
    center_id IN (SELECT id FROM centers WHERE owner_id = auth.uid())
  );

-- trainer_likes RLS
ALTER TABLE trainer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "센터 소유자는 좋아요를 관리할 수 있다"
  ON trainer_likes FOR ALL
  USING (
    center_id IN (SELECT id FROM centers WHERE owner_id = auth.uid())
  );

CREATE POLICY "인증 사용자는 좋아요를 조회할 수 있다"
  ON trainer_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);
```
