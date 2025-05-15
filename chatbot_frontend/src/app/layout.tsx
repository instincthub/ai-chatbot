import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Support Chatbot",
  description: "AI-powered customer support chatbot with RAG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
