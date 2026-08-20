"use client";

import { useEffect } from "react";

// Marca o navegador para NÃO ser contabilizado no mapa de calor.
// Montado nas áreas logadas (app + admin): quem entra no app é você ou um
// usuário — não um lead. A flag fica no localStorage e o HeatTracker a respeita
// mesmo depois, quando esse mesmo navegador visita a landing deslogado.
export const HEAT_OPTOUT_KEY = "pf_heat_optout";

export default function HeatOptOut() {
  useEffect(() => {
    try {
      localStorage.setItem(HEAT_OPTOUT_KEY, "1");
    } catch {
      /* ignora */
    }
  }, []);
  return null;
}
