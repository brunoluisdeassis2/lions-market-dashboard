import api from "./api";

/*
 * Indicadores administrativos.
 *
 * O backend deve expor GET /dashboard/summary devolvendo os totais já
 * calculados. Não calculamos indicadores no frontend para não duplicar
 * regra de negócio nem baixar listas inteiras só para contar registros.
 */
export async function obterResumo() {
  const { data } = await api.get("/dashboard/summary");
  return data;
}