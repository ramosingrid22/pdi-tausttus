"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="ml-auto btn-primary text-sm">
      Imprimir histórico
    </button>
  );
}
