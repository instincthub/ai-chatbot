import "./globals.css";
import "@instincthub/react-ui/assets/css/styles.css";
import type { Metadata } from "next";
import { SessionProvider } from "../components/providers/SessionProvider";

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
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
