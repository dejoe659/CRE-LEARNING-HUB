import { Suspense } from "react";
import Catalogue from "@/app/(site)/courses/Catalogue";

export default function Explore() {
  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Loading…</div>}>
        <Catalogue basePath="/dashboard/explore" />
      </Suspense>
    </div>
  );
}
