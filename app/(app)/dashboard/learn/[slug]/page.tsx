import { Suspense } from "react";
import Learn from "./Learn";

export default function LearnPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Loading lesson…</div>}>
      <Learn slug={params.slug} />
    </Suspense>
  );
}
