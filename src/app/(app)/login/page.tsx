export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="px-6 text-center">
        <h1 className="mb-8 text-3xl font-bold text-accent">
          Sign in to your SDK workspace
        </h1>
        <a
          href="/auth/login"
          className="inline-block rounded-control bg-accent px-6 py-3 font-semibold text-dark transition-colors hover:bg-accent/90"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
