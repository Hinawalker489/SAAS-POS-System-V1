'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

