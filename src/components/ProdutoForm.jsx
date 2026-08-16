import { useState } from "react";

import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import Input from "./Input";
import Select from "./Select";
import { getApiErrorMessage } from "../utils/errors";
import { validarProduto } from "../utils/validators";

/*
 * FORMULÁRIO DE PRODUTO (cadastro e edição)
 *
 * Recebe "produto" quando é edição e chama "onSalvar" com o payload já
 * no formato esperado pela API. As mensagens de validação aparecem ao
 * lado de cada campo; a validação definitiva também existe no backend.
 */
export default function ProdutoForm({ produto, onSalvar, onCancelar }) {
  // Os inputs guardam strings; a conversão para número acontece no envio.
  const [form, setForm] = useState({
    nome: produto?.name || "",
    descricao: produto?.description || "",
    preco: produto?.price !== undefined ? String(produto.price) : "",
    estoque: produto?.stock !== undefined ? String(produto.stock) : "",
    categoria: produto?.category || "",
    ativo: produto?.active !== false,
  });

  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [salvando, setSalvando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroApi("");

    const novosErros = validarProduto(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);

    try {
      await onSalvar({
        name: form.nome.trim(),
        description: form.descricao.trim(),
        price: Number(form.preco),
        stock: Number(form.estoque),
        category: form.categoria,
        active: form.ativo,
      });
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível salvar o produto. Verifique os dados."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage mensagem={erroApi} />

      <Input
        id="produto-nome"
        name="nome"
        label="Nome"
        value={form.nome}
        onChange={handleChange}
        error={erros.nome}
      />

      <div className="form-field">
        <label htmlFor="produto-descricao">Descrição</label>
        <textarea
          id="produto-descricao"
          name="descricao"
          rows={3}
          value={form.descricao}
          onChange={handleChange}
        />
      </div>

      <Input
        id="produto-preco"
        name="preco"
        label="Preço"
        type="number"
        step="0.01"
        min="0"
        value={form.preco}
        onChange={handleChange}
        error={erros.preco}
      />

      <Input
        id="produto-estoque"
        name="estoque"
        label="Estoque"
        type="number"
        step="1"
        min="0"
        value={form.estoque}
        onChange={handleChange}
        error={erros.estoque}
      />

      <Select
        id="produto-categoria"
        name="categoria"
        label="Categoria"
        value={form.categoria}
        onChange={handleChange}
        error={erros.categoria}
      >
        <option value="">Selecione</option>
        <option value="eletronicos">Eletrônicos</option>
        <option value="informatica">Informática</option>
        <option value="acessorios">Acessórios</option>
        <option value="casa">Casa</option>
        <option value="outros">Outros</option>
      </Select>

      <div className="form-field form-field-inline">
        <input
          id="produto-ativo"
          type="checkbox"
          checked={form.ativo}
          onChange={(evento) => setForm((a) => ({ ...a, ativo: evento.target.checked }))}
        />
        <label htmlFor="produto-ativo">Produto ativo</label>
      </div>

      <div className="form-actions">
        <Button type="submit" loading={salvando} loadingText="Salvando...">
          Salvar
        </Button>
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}