
export default async function Home() {
  const response = await fetch("http://localhost:8080/api/test", {
    cache: "no-store",
  });

  const message = await response.text();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Budget Tracker
      </h1>
      <p>{message}</p>
    </main>
  );
}
