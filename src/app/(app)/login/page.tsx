export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#082003]">
      <div className="text-center px-6">
        <h1
          className="text-3xl font-bold text-[#2cdb16] mb-8"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Sign in to your SDK workspace
        </h1>
        <a
          href="/auth/login"
          className="inline-block px-6 py-3 bg-[#2cdb16] text-[#082003] rounded-md font-semibold hover:bg-[#22b812] transition-colors"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
