import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import { DM_Serif_Display, Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif-display",
});

export const metadata = {
  title: "AwaData Commons — African Mental Health Data Sovereignty",
  description:
    "Community-governed mental health data commons piloted with young people, lived-experience advocates, and community health workers to replace extractive data mining with community ownership and benefit-sharing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${manrope.variable} ${dmSerifDisplay.variable}`}>
      <body className="min-h-full flex flex-col bg-[#f6f1e7] text-[#172c26] [font-family:var(--font-manrope),sans-serif] selection:bg-[#f2ca56] selection:text-[#173f34] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="border-t border-[#172c26]/10 bg-[#fffaf0] py-12 text-center text-xs text-[#324d45]">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="grid size-6 grid-cols-2 overflow-hidden rounded-full border border-[#172c26]/20">
                  <span className="bg-[#e3613f]" />
                  <span className="bg-[#f2ca56]" />
                  <span className="bg-[#6ba785]" />
                  <span className="bg-[#193c34]" />
                </span>
                <span className="font-bold text-base text-[#172c26] [font-family:var(--font-dm-serif-display),serif]">
                  AwaData Commons
                </span>
              </div>
              <p className="font-bold text-[#172c26] text-xs">
                Decolonizing Mental Health Data Governance
              </p>
              <p className="text-[11px] leading-relaxed max-w-2xl mx-auto text-[#4b625b]">
                Designed to stop extractive data exploitation of African communities. Built upon dual-key sovereign consent:
                individual consent never substitutes for community governance, and community approval never overrides an individual&apos;s refusal.
              </p>
              <p className="text-[10px] text-[#4b625b]/70 pt-2">
                &copy; 2026 AwaData Commons. Synthetic demonstration proof of concept.
              </p>
            </div>
          </footer>
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
