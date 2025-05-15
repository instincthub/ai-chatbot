"use client";

export default function ChatPage() {
  return (
    <div className="ihub-flex ihub-flex-col ihub-h-[calc(100vh-9rem)]">
      <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-4">Chat</h1>

      <div className="ihub-flex ihub-flex-row ihub-h-full ihub-gap-4">
        <div className="ihub-w-1/4 ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-p-4 ihub-overflow-y-auto">
          <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-4">
            Conversations
          </h2>
          <div className="ihub-flex ihub-justify-between ihub-items-center ihub-mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              className="ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded ihub-w-full"
            />
          </div>
          <p className="ihub-text-gray-500 ihub-text-center ihub-mt-6">
            No conversations yet
          </p>
        </div>

        <div className="ihub-flex-1 ihub-flex ihub-flex-col ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-overflow-hidden">
          <div className="ihub-p-4 ihub-border-b ihub-font-semibold">
            New Conversation
          </div>

          <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
            <div className="ihub-flex ihub-flex-col ihub-gap-4">
              <p className="ihub-text-gray-500 ihub-text-center ihub-my-8">
                Start a new conversation by typing a message below.
              </p>
            </div>
          </div>

          <div className="ihub-border-t ihub-p-4">
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
      </div>
    </div>
  );
}
