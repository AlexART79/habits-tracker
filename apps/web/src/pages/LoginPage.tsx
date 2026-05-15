export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2 text-center">Habit Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Sign in to track your habits</p>
        <div className="flex flex-col gap-3">
          <a
            href="/auth/google"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Continue with Google
          </a>
          <a
            href="/auth/github"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border-transparent bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
