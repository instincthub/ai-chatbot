"use client";

interface Params {
  params: {
    id: string;
  };
}

export default function WidgetPreview({ params }: Params) {
  const { id } = params;

  return (
    <div className="ihub-flex ihub-flex-col ihub-h-screen ihub-bg-white">
      <div className="ihub-p-3 ihub-bg-blue-600 ihub-text-white ihub-text-center">
        <h1 className="ihub-text-lg ihub-font-semibold">Support Chat</h1>
      </div>

      <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
        <div className="ihub-mb-4 ihub-bg-gray-100 ihub-rounded-lg ihub-p-3 ihub-max-w-xs">
          <p>Hello! How can I help you today?</p>
        </div>
      </div>

      <div className="ihub-p-3 ihub-border-t">
        <div className="ihub-flex ihub-gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="ihub-flex-1 ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
          />
          <button className="ihub-bg-blue-600 ihub-text-white ihub-px-4 ihub-py-2 ihub-rounded ihub-font-medium ihub-hover:ihub-bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
