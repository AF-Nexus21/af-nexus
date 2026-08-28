import type { Metadata } from "next";
import "./globals.css";
import FloatingChatbot from "./components/FloatingChatbot";

export const metadata: Metadata = {
  title: "AF-NEXUS",
  description: "Smarter School Management Starts Here",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <FloatingChatbot />
      </body>
    </html>
  );
}