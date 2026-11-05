import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRE Learning Hub",
    short_name: "CRE Hub",
    description: "Animated video lessons, notes, quizzes and exams for Computer and Robotics Education.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F172A",
    theme_color: "#2563EB",
    categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My courses", url: "/dashboard/my-courses" },
      { name: "Quizzes", url: "/dashboard/quizzes" },
      { name: "AI Tutor", url: "/dashboard/ai-tutor" },
    ],
  };
}
