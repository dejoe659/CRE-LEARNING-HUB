import { Suspense } from "react";
import Quizzes from "./Quizzes";

export default function Page() {
  return <Suspense><Quizzes /></Suspense>;
}
