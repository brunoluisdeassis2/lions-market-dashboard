/*
 * Paginação simples.
 *
 * A página atual e o total de páginas vêm do backend. O componente apenas
 * avisa o componente pai qual página deve ser carregada.
 */
export default function Pagination({ pagina, totalPaginas, onMudarPagina }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={pagina <= 1}
        onClick={() => onMudarPagina(pagina - 1)}
      >
        Anterior
      </button>

      <span>
        Página {pagina} de {totalPaginas}
      </span>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={pagina >= totalPaginas}
        onClick={() => onMudarPagina(pagina + 1)}
      >
        Próxima
      </button>
    </div>
  );
}