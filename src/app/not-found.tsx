import Link from "next/link";
import { Overlap } from "@/components/art/shapes";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-butter px-5 text-center">
      <div>
        <Overlap className="mx-auto w-56" />
        <h1 className="mega mt-8">No overlap here.</h1>
        <p className="mt-6 text-[19px] font-medium">That page doesn&apos;t exist — but plenty of good things do.</p>
        <Link href="/" className="btn btn-lg mt-10 bg-tomato text-ink">Take me home</Link>
      </div>
    </main>
  );
}
