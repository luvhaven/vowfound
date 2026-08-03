export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading operations">
      <div className="h-3 w-28 rounded-full bg-onink/10" />
      <div className="mt-5 h-14 max-w-lg rounded-[12px] bg-onink/7" />
      <div className="mt-10 h-80 rounded-[24px] border border-hairline bg-white/[0.025]" />
    </div>
  );
}
