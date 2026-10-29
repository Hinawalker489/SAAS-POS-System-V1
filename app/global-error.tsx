'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-destructive mb-4">Application Error</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button
              onClick={reset}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

