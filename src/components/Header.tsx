"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-brand-dark text-white no-print">
      <div className="flex items-stretch justify-between px-4 sm:px-6">
        {/* Logo + nav desktop */}
        <div className="flex items-stretch gap-0">
          <Link href="/dashboard" className="flex items-center pr-4 sm:pr-6 py-4">
            <span className="text-brand-orange font-black text-xl tracking-tight">TAUSTTUS</span>
          </Link>
          {user?.role === "ADMIN" && (
            <nav className="hidden sm:flex items-stretch gap-0 ml-2">
              <Link href="/dashboard" className="flex items-center px-4 text-xs text-stone-400 hover:text-white hover:bg-white/5 transition-colors border-b-2 border-transparent hover:border-brand-orange">
                Avaliações
              </Link>
              <Link href="/admin/usuarios" className="flex items-center px-4 text-xs text-stone-400 hover:text-white hover:bg-white/5 transition-colors border-b-2 border-transparent hover:border-brand-orange">
                Usuários
              </Link>
              <Link href="/admin/preview" className="flex items-center px-4 text-xs text-stone-400 hover:text-white hover:bg-white/5 transition-colors border-b-2 border-transparent hover:border-brand-orange">
                Preview
              </Link>
            </nav>
          )}
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-stone-400">{user.cargo ?? user.role}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/pdi/login" })}
                className="hidden sm:block text-xs text-stone-400 hover:text-white transition-colors"
              >
                Sair
              </button>
            </>
          )}
          {/* Hamburguer mobile */}
          {user && (
            <button
              className="sm:hidden p-2 text-stone-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {menuOpen && user && (
        <div className="sm:hidden border-t border-white/10 px-4 py-3 space-y-1">
          <div className="text-sm font-medium text-white mb-1">{user.name}</div>
          <div className="text-xs text-stone-400 mb-3">{user.cargo ?? user.role}</div>
          {user.role === "ADMIN" && (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-stone-300 hover:text-white">Avaliações</Link>
              <Link href="/admin/usuarios" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-stone-300 hover:text-white">Usuários</Link>
              <Link href="/admin/preview" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-stone-300 hover:text-white">Preview</Link>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/pdi/login" })}
            className="block py-2 text-sm text-stone-400 hover:text-white"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
