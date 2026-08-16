/* Funções simples de formatação usadas nas tabelas e telas de detalhe. */

// Formata valores monetários em Real. Valores inválidos viram "-" para não quebrar a tabela.
export function formatCurrency(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return "-";

  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Formata datas ISO vindas do MongoDB (ex.: 2024-05-10T12:00:00.000Z).
export function formatDate(valor) {
  if (!valor) return "-";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleDateString("pt-BR");
}

// O backend pode devolver "_id" (Mongo) ou "id". Centralizamos essa leitura.
export function getId(registro) {
  return registro?._id ?? registro?.id ?? "";
}

// Mostra apenas o final do ObjectId do Mongo, que é longo demais para a tabela.
export function shortId(valor) {
  const texto = String(valor || "");
  return texto.length > 8 ? `#${texto.slice(-8)}` : `#${texto}`;
}