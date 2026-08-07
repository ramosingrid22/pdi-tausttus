"use client";
import { useMemo } from "react";

export function Saudacao({ nome }: { nome: string }) {
  const saudacao = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  return (
    <>
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">
        {saudacao},
      </p>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
        {nome}
      </h1>
    </>
  );
}
