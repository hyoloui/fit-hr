import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, Users, FileText, Heart, ArrowRight } from "lucide-react";
import { APP_NAME } from "@/constants";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              피트니스 업계
              <br />
              채용의 새로운 기준
            </h1>
            <p className="text-xl text-muted-foreground">
              {APP_NAME}에서 최고의 트레이너를 만나고, 최적의 일자리를 찾으세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">구인공고 둘러보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 {APP_NAME}인가요?</h2>
            <p className="text-muted-foreground text-lg">
              피트니스 업계에 특화된 채용 플랫폼으로 더 빠르고 효율적으로 인재를 찾으세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <Briefcase className="h-12 w-12 text-primary mb-4" />
                <CardTitle>맞춤 구인공고</CardTitle>
                <CardDescription>
                  피트니스 업계에 최적화된 구인공고 시스템으로 원하는 조건의 인재를 정확하게
                  찾으세요
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>전문 트레이너 풀</CardTitle>
                <CardDescription>
                  검증된 트레이너들의 이력서를 한눈에 확인하고 최적의 인재를 찾으세요
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>간편한 지원 시스템</CardTitle>
                <CardDescription>
                  몇 번의 클릭만으로 간편하게 지원하고 지원 현황을 실시간으로 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>스마트 매칭</CardTitle>
                <CardDescription>
                  관심 공고를 저장하고 맞춤형 추천으로 나에게 딱 맞는 일자리를 찾으세요
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">이용 방법</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* 트레이너용 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center">트레이너</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">회원가입 및 이력서 작성</h4>
                    <p className="text-sm text-muted-foreground">
                      간단한 정보를 입력하고 나만의 이력서를 작성하세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">구인공고 검색 및 지원</h4>
                    <p className="text-sm text-muted-foreground">
                      원하는 조건의 공고를 찾아 간편하게 지원하세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">지원 결과 확인</h4>
                    <p className="text-sm text-muted-foreground">
                      지원한 공고의 현황을 실시간으로 확인하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 센터용 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center">센터</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">회원가입 및 센터 정보 등록</h4>
                    <p className="text-sm text-muted-foreground">
                      센터 정보를 등록하고 채용을 시작하세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">구인공고 등록</h4>
                    <p className="text-sm text-muted-foreground">
                      필요한 인재의 조건을 상세히 입력하여 공고를 등록하세요
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">지원자 관리</h4>
                    <p className="text-sm text-muted-foreground">
                      지원자의 이력서를 확인하고 채용 프로세스를 진행하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">지금 바로 시작하세요</h2>
            <p className="text-xl text-muted-foreground">
              {APP_NAME}에서 최고의 트레이너를 만나고, 최적의 일자리를 찾으세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">무료 회원가입</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
