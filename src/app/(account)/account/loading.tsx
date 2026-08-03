export default function AccountLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading your folio">
      <div className="h-3 w-24 rounded-full bg-onink/10" />
      <div className="mt-5 h-14 max-w-xl rounded-[12px] bg-onink/7" />
      <div className="mt-10 h-72 rounded-[24px] bg-white/[0.035]" />
    </div>
  );
}
