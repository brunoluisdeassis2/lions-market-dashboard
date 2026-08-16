/* Validações usadas pelos formulários. As validações definitivas são do backend. */

export function isEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/*
 * Valida o formulário de produto e devolve um objeto de erros por campo.
 * Um objeto vazio significa "formulário válido".
 */
export function validarProduto(form) {
  const erros = {};

  if (!form.nome.trim()) {
    erros.nome = "Nome é obrigatório.";
  }

  if (!form.categoria.trim()) {
    erros.categoria = "Categoria é obrigatória.";
  }

  const preco = Number(form.preco);
  if (form.preco === "" || Number.isNaN(preco) || preco <= 0) {
    erros.preco = "Preço deve ser maior que zero.";
  }

  const estoque = Number(form.estoque);
  if (form.estoque === "" || Number.isNaN(estoque)) {
    erros.estoque = "Estoque é obrigatório.";
  } else if (estoque < 0) {
    erros.estoque = "Estoque não pode ser negativo.";
  } else if (!Number.isInteger(estoque)) {
    erros.estoque = "Estoque deve ser um número inteiro.";
  }

  return erros;
}