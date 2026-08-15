export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#082003]">
      <div className="text-center px-6">
        <h1 className="mb-8 font-mono text-3xl font-bold text-[#2cdb16]">
          Sign in to your SDK workspace
        </h1>
        <a
          href="/auth/login"
          className="inline-block rounded-md bg-[#2cdb16] px-6 py-3 font-mono font-semibold text-[#082003] transition-colors hover:bg-[#22b812]"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
