import { useCallback, useEffect, useState } from "react";

import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import AppLayout from "../layouts/AppLayout";
import { obterResumo } from "../services/dashboardService";
import { getApiErrorMessage } from "../utils/errors";

/*
 * DASHBOARD ADMINISTRATIVO
 *
 * Os indicadores vêm prontos da API (GET /dashboard/summary).
 * Não há números inventados: enquanto o backend não responder,
 * a tela mostra loading ou a mensagem de erro.
 */
export default function DashboardPage() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // useCallback permite reutilizar a mesma função no efeito e no botão "Tentar novamente".
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await obterResumo();
      setResumo(dados);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível carregar os indicadores."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Os nomes dos campos seguem o que o backend deve retornar.
  const indicadores = [
    { rotulo: "TOTAL DE USUÁRIOS", valor: resumo?.totalUsers },
    { rotulo: "TOTAL DE PRODUTOS", valor: resumo?.totalProducts },
    { rotulo: "PEDIDOS", valor: resumo?.totalOrders },
    { rotulo: "PEDIDOS PENDENTES", valor: resumo?.pendingOrders },
    { rotulo: "SEM ESTOQUE", valor: resumo?.outOfStockProducts },
  ];

  return (
    <AppLayout titulo="Dashboard">
      {carregando && <Loading texto="Carregando indicadores..." />}
      {!carregando && erro && <ErrorMessage mensagem={erro} onRetry={carregar} />}

      {!carregando && !erro && (
        <div className="cards">
          {indicadores.map((indicador) => (
            <div className="card" key={indicador.rotulo}>
              <span className="card-label">{indicador.rotulo}</span>
              {/* Se o campo não vier na resposta, mostramos "-" em vez de inventar valor. */}
              <strong className="card-value">
                {indicador.valor === undefined || indicador.valor === null ? "-" : indicador.valor}
              </strong>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}