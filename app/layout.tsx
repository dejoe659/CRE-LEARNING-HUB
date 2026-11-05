import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ProgressProvider } from "@/lib/progress";
import { ContentProvider } from "@/lib/content";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: { default: "CRE Learning Hub – Computer & Robotics Education", template: "%s · CRE Learning Hub" },
  description:
    "Animated video lessons, practical guides, quizzes and examinations for Computer and Robotics Education students, 100 to 400 Level.",
  applicationName: "CRE Learning Hub",
  appleWebApp: { capable: true, title: "CRE Hub", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#2563EB", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Poppins, Inter, system-ui, sans-serif" }}>
        <AuthProvider>
          <ContentProvider>
            <ProgressProvider>{children}</ProgressProvider>
            <RegisterSW />
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
