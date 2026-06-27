import { register } from "./actions";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="max-w-sm mx-auto">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Bergabung
      </p>
      <h1 className="font-display text-3xl mb-6">Daftar Alumni</h1>

      {searchParams.error && (
        <p className="text-sm text-maroon mb-4 bg-maroon/5 border border-maroon/30 rounded-sm px-3 py-2">
          {searchParams.error}
        </p>
      )}

      <form action={register} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Kata Sandi</label>
          <input
            type="password"
            name="password"
            minLength={6}
            required
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark"
        >
          Buat Akun
        </button>
      </form>

      <p className="font-body text-sm text-slate mt-5">
        Sudah punya akun?{" "}
        <a href="/login" className="text-maroon underline">
          Masuk di sini
        </a>
      </p>
    </div>
  );
}
