"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { List, Locate } from "lucide-react";
import Link from "next/link";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobMapPanel } from "@/components/jobs/JobMapPanel";
import type { JobFilter as JobFilterType, JobPostingWithDetails } from "@/types";

const GANGNAM_STATION = { lat: 37.4979, lng: 127.0276 };

interface JobMapViewProps {
  jobs: JobPostingWithDetails[];
  isAuthenticated: boolean;
  userId?: string;
  currentSearchParams: string;
  currentFilter?: JobFilterType;
}

export function JobMapView({
  jobs,
  isAuthenticated,
  userId,
  currentSearchParams,
  currentFilter,
}: JobMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);

  const [selectedJobs, setSelectedJobs] = useState<JobPostingWithDetails[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const initMap = useCallback((lat: number, lng: number) => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = new naver.maps.Map(mapContainerRef.current, {
      center: new naver.maps.LatLng(lat, lng),
      zoom: 12,
      logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
      mapDataControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
      scaleControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
    });
    setIsMapReady(true);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const tryInit = () => {
      if (!window.naver?.maps) return;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
          () => initMap(GANGNAM_STATION.lat, GANGNAM_STATION.lng),
          { timeout: 5000 }
        );
      } else {
        initMap(GANGNAM_STATION.lat, GANGNAM_STATION.lng);
      }
    };

    // 네이버 지도 스크립트가 이미 로드됐는지 확인
    if (window.naver?.maps) {
      tryInit();
    } else {
      // 스크립트 로드 대기
      const timer = setTimeout(tryInit, 500);
      return () => clearTimeout(timer);
    }
  }, [initMap]);

  // 마커 렌더링 (지도 준비 완료 후)
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 좌표가 있는 공고만 필터링 (서버에서 IS NOT NULL로 필터하지만 TypeScript 타입 가드)
    const jobsWithCoords = jobs.filter(
      (job): job is JobPostingWithDetails & { latitude: number; longitude: number } =>
        job.latitude !== null && job.longitude !== null
    );

    // 좌표 기준 그룹핑 (소수점 4자리)
    const groups = new Map<
      string,
      (JobPostingWithDetails & { latitude: number; longitude: number })[]
    >();
    jobsWithCoords.forEach((job) => {
      const key = `${job.latitude.toFixed(4)},${job.longitude.toFixed(4)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(job);
    });

    groups.forEach((groupJobs) => {
      const { latitude: lat, longitude: lng } = groupJobs[0];
      const count = groupJobs.length;

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: mapRef.current!,
        icon: {
          // 네이버 지도 Marker content는 HTML string이므로 Tailwind 클래스 사용 불가 - 인라인 style 불가피
          content: `<div style="background:${count > 1 ? "#2563eb" : "#3b82f6"};color:white;border-radius:50%;width:${count > 1 ? "36px" : "28px"};height:${count > 1 ? "36px" : "28px"};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">${count > 1 ? count : "●"}</div>`,
          anchor: new naver.maps.Point(count > 1 ? 18 : 14, count > 1 ? 18 : 14),
        },
      });

      naver.maps.Event.addListener(marker, "click", () => {
        setSelectedJobs(groupJobs);
        setIsPanelOpen(true);
      });

      markersRef.current.push(marker);
    });
  }, [isMapReady, jobs]);

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current!.setCenter(new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        mapRef.current!.setZoom(14);
      },
      () => {
        toast.error("현재 위치를 가져올 수 없습니다.");
      }
    );
  };

  const jobsHref = `/jobs${currentSearchParams ? `?${currentSearchParams}` : ""}`;

  return (
    <div className="relative w-full h-full">
      {/* 지도 캔버스 */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 모바일 상단 플로팅 바 */}
      <div className="absolute top-3 left-3 right-3 flex gap-2 lg:hidden z-10">
        {currentFilter && <JobFilter currentFilter={currentFilter} />}

        <Button variant="outline" size="sm" className="shadow-md" asChild>
          <Link href={jobsHref}>
            <List className="h-4 w-4 mr-1" />
            목록
          </Link>
        </Button>

        <div className="flex-1 flex items-center justify-end">
          <span className="bg-background/90 text-xs px-2 py-1 rounded-full shadow-md">
            {jobs.length}개 공고
          </span>
        </div>
      </div>

      {/* 현재 위치 버튼 (우하단) */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-6 right-4 shadow-md z-10"
        onClick={handleLocate}
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* 데스크톱: 목록으로 버튼 */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-3 right-3 shadow-md z-10 hidden lg:flex"
        asChild
      >
        <Link href={jobsHref}>
          <List className="h-4 w-4 mr-1" />
          목록으로 보기
        </Link>
      </Button>

      {/* 공고 패널 */}
      <JobMapPanel
        jobs={selectedJobs}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        isAuthenticated={isAuthenticated}
        userId={userId}
      />
    </div>
  );
}
