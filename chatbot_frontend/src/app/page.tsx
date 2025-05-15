import Link from "next/link";

export default function Home() {
  return (
    <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
      <div className="ihub-text-center ihub-max-w-2xl ihub-p-8">
        <h1 className="ihub-text-4xl ihub-font-bold ihub-mb-4">
          Customer Support Chatbot
        </h1>
        <p className="ihub-text-xl ihub-mb-8">
          AI-powered support chatbot that leverages your company documents to
          provide accurate responses.
        </p>
        <div className="ihub-flex ihub-gap-4 ihub-justify-center">
          <Link
            href="/login"
            className="ihub-bg-blue-600 ihub-text-white ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/chat"
            className="ihub-bg-gray-200 ihub-text-gray-800 ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-gray-300"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
