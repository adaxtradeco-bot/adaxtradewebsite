export default function Loading() {
  return (
    <div
      role="status"
      className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-neutral-900"
    >
      <div
        aria-hidden="true"
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"
      />
    </div>
  );
}
