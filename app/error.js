"use client";

export default function Error({ reset }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-4xl font-medium">We couldn&apos;t load this page</h1>
        <p className="mt-3 text-muted">Please try again in a moment.</p>
        <button onClick={reset} className="btn-dark mt-8">Try again</button>
      </div>
    </div>
  );
}
