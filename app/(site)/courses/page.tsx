import { Suspense } from "react";
import Catalogue from "./Catalogue";

export const metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="section py-24 text-center text-slate-500">Loading courses…</div>}>
      <Catalogue />
    </Suspense>
  );
}
