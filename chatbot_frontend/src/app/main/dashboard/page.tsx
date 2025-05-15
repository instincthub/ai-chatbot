"use client";

export default function Dashboard() {
  return (
    <div>
      <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-6">Dashboard</h1>

      <div className="ihub-grid ihub-grid-cols-1 md:ihub-grid-cols-3 ihub-gap-6">
        <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
          <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">
            Documents
          </h2>
          <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
          <p className="ihub-mt-2 ihub-text-gray-500">
            Total documents in knowledge base
          </p>
        </div>

        <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
          <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">
            Conversations
          </h2>
          <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
          <p className="ihub-mt-2 ihub-text-gray-500">
            Total chat conversations
          </p>
        </div>

        <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
          <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">Widgets</h2>
          <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
          <p className="ihub-mt-2 ihub-text-gray-500">Active chat widgets</p>
        </div>
      </div>
    </div>
  );
}
