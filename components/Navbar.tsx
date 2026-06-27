import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import MobileNav from "@/components/MobileNav";

export default async function Navbar() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const searchForm = (widthClass: string) => (
    <form method="get" action="/cari" className={`flex items-center ${widthClass}`}>
      <input
        type="text"
        name="q"
        placeholder="Cari..."
        className="w-full border border-line rounded-sm px-2.5 py-1.5 bg-white text-sm focus:outline-none focus:border-maroon"
      />
    </form>
  );

  const navLinks = (
    <>
      <Link href="/alumni" className="hover:text-maroon">
        Direktori
      </Link>
      <Link href="/persebaran" className="hover:text-maroon">
        Persebaran
      </Link>
      <Link href="/blog" className="hover:text-maroon">
        Cerita
      </Link>
      <Link href="/gallery" className="hover:text-maroon">
        Galeri
      </Link>
      <Link href="/agenda" className="hover:text-maroon">
        Agenda
      </Link>
      <Link href="/usaha" className="hover:text-maroon">
        Usaha
      </Link>
      <Link href="/kas" className="hover:text-maroon">
        Kas
      </Link>
      {user ? (
        <>
          <Link href="/dashboard" className="hover:text-maroon">
            Profil
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-maroon">
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-maroon text-paper px-3 py-1.5 rounded-sm hover:bg-maroon-dark w-fit"
          >
            Daftar
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="border-b border-line bg-paper sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl tracking-tight flex-shrink-0">
          Jin1abad<span className="text-maroon">.</span>
        </Link>

        {/* Menu lengkap + kotak cari untuk layar PC/tablet ke atas */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-body">
          {searchForm("w-32")}
          {navLinks}
        </nav>

        {/* Menu hamburger untuk layar HP, kotak cari ada di paling atas dropdown-nya */}
        <MobileNav>
          {searchForm("w-full mb-1")}
          {navLinks}
        </MobileNav>
      </div>
    </header>
  );
}
