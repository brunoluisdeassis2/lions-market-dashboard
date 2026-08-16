/* Estado vazio: a requisição funcionou, mas não há registros para mostrar. */
export default function EmptyState({ texto = "Nenhum registro encontrado." }) {
  return <p className="state-message">{texto}</p>;
}