export default function MapLoading() {
  return (
    <div className="-m-4 -mt-4 md:-m-6 h-[calc(100%+5rem)] md:h-[calc(100%+3rem)] flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">지도를 불러오는 중...</p>
      </div>
    </div>
  );
}
