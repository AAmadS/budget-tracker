export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-teal-950">
        Your money, in perspective.
      </h1>

      <p className="mt-2 text-gray-500">
        Here's where your budget stands.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-teal-950">
          Monthly overview
        </h2>

        <p className="mt-3 text-gray-500">
          Your budget summary will appear here once we connect
          your transactions and budgets.
        </p>
      </section>
    </div>
  );
}