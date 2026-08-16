/* Estado de carregamento. Recebe o texto para ficar claro o que está carregando. */
export default function Loading({ texto = "Carregando..." }) {
  return <p className="state-message">{texto}</p>;
}