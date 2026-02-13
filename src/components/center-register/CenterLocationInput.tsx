"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2 } from "lucide-react";

interface CenterLocationInputProps {
  onLocationSelect: (data: { address: string; latitude: number; longitude: number }) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  disabled?: boolean;
}

function geocodeAddress(query: string): Promise<{
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
} | null> {
  return new Promise((resolve) => {
    if (!naver?.maps?.Service?.geocode) {
      resolve(null);
      return;
    }

    naver.maps.Service.geocode({ query }, (status, response) => {
      if (status !== naver.maps.Service.Status.OK) {
        resolve(null);
        return;
      }

      const result = response.v2;
      if (result.meta.totalCount === 0 || result.addresses.length === 0) {
        resolve(null);
        return;
      }

      const first = result.addresses[0];
      resolve({
        roadAddress: first.roadAddress,
        jibunAddress: first.jibunAddress,
        latitude: parseFloat(first.y),
        longitude: parseFloat(first.x),
      });
    });
  });
}

export function CenterLocationInput({
  onLocationSelect,
  initialAddress = "",
  initialLat,
  initialLng,
  disabled = false,
}: CenterLocationInputProps) {
  const [address, setAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<{
    roadAddress: string;
    latitude: number;
    longitude: number;
  } | null>(
    initialLat && initialLng
      ? { roadAddress: initialAddress, latitude: initialLat, longitude: initialLng }
      : null
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);

  const initMap = useCallback((lat: number, lng: number) => {
    if (!mapContainerRef.current || !naver?.maps) return;

    const location = new naver.maps.LatLng(lat, lng);

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new naver.maps.Map(mapContainerRef.current, {
        center: location,
        zoom: 16,
        mapTypeControl: true,
      });

      markerRef.current = new naver.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        title: "센터 위치",
      });
    } else {
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(16);
      markerRef.current?.setPosition(location);
    }
  }, []);

  useEffect(() => {
    if (initialLat && initialLng) {
      const timer = setTimeout(() => initMap(initialLat, initialLng), 500);
      return () => clearTimeout(timer);
    }
  }, [initialLat, initialLng, initMap]);

  const handleSearch = async () => {
    if (!address.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }

    if (!naver?.maps?.Service) {
      setError("지도 서비스가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await geocodeAddress(address);

    if (result) {
      const { roadAddress, latitude, longitude } = result;
      setMapData({ roadAddress, latitude, longitude });
      setAddress(roadAddress);
      setError(null);

      onLocationSelect({ address: roadAddress, latitude, longitude });

      setTimeout(() => initMap(latitude, longitude), 100);
    } else {
      setError("주소를 찾을 수 없습니다. 다시 확인해주세요.");
      setMapData(null);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      <Label>센터 위치</Label>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="주소를 입력하세요 (예: 서울 강남구 테헤란로 123)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={disabled || isLoading || !address.trim()}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">조회</span>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {mapData && (
        <div className="space-y-2">
          <div ref={mapContainerRef} className="h-[320px] w-full rounded-md border" />
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{mapData.roadAddress}</p>
              <p className="text-muted-foreground">
                위도: {mapData.latitude.toFixed(6)}, 경도: {mapData.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!mapData && !error && (
        <p className="text-xs text-muted-foreground">
          주소를 입력하고 조회 버튼을 눌러 지도에서 위치를 확인하세요.
        </p>
      )}
    </div>
  );
}
