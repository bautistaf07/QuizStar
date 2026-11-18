const metrics = [
  { label: "Usuarios activos", value: "0" },
  { label: "Quices creados", value: "0" },
  { label: "Quices resueltos", value: "0" },
  { label: "Participación", value: "0 %" },
];

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-500">QuizStar</p>
        <h1 className="text-2xl font-semibold text-gray-800
                       dark:text-white/90">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-5
                       dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-800
                          dark:text-white/90">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}