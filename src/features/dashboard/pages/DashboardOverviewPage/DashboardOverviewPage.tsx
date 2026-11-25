import { useEffect, useMemo, useState } from "react";
import { DashboardStatCard } from "../../../../components/DashboardStatCard/DashboardStatCard";
import { getParkingSessions } from "../../../auth/services/parkingSessionService";
import type { ParkingSession } from "../../../auth/types/parkingSession.types";
import { localDateKey, summarizePeriod, type Period } from "./dashboardPeriod";
import styles from "./DashboardOverviewPage.module.css";

const labels = { day: "Dia", month: "Mês", year: "Ano" };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function DashboardOverviewPage() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [dates, setDates] = useState(() => {
    const today = localDateKey(new Date());
    return { day: today, month: today.slice(0, 7), year: today.slice(0, 4) };
  });
  const value = dates[period];
  const valid = period === "year" ? /^[1-9]\d{3}$/.test(value) : Boolean(value);
  const totals = useMemo(() => summarizePeriod(sessions, period, value), [sessions, period, value]);

  useEffect(() => {
    let active = true;
    getParkingSessions()
      .then((data) => { if (active) setSessions(data); })
      .catch(() => { if (active) setErrorMessage("Erro ao carregar os dados do dashboard."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className={styles.page}>
      <h1>Dashboard do estacionamento</h1>
      <div className={styles.filters}>
        <label>Filtrar por
          <select value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
            {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label>{labels[period]} de referência
          <input key={period} type={{ day: "date", month: "month", year: "number" }[period]}
            min={period === "year" ? 1000 : undefined} max={period === "year" ? 9999 : undefined}
            value={value} onChange={(event) => setDates({ ...dates, [period]: event.target.value })} />
        </label>
      </div>
      {errorMessage ? <p role="alert">{errorMessage}</p> : isLoading ? <p role="status">Carregando dados...</p>
        : !valid ? <p role="status">Informe {period === "year" ? "um ano entre 1000 e 9999" : "uma data válida"} para consultar os indicadores.</p>
        : <>
          <h2>Movimentação</h2>
          <p>Sessões com entrada no período, agrupadas pela situação atual.</p>
          <div className={styles.cards}>
            <DashboardStatCard title="Entradas" value={totals.entries} />
            <DashboardStatCard title="Sessões abertas" value={totals.ABERTO} />
            <DashboardStatCard title="Sessões fechadas" value={totals.FECHADO} />
            <DashboardStatCard title="Sessões canceladas" value={totals.CANCELADO} />
          </div>
          <div className={styles.revenue}>
            <h2>Faturamento</h2>
            <strong>{currency.format(totals.revenue / 100)}</strong>
            <p>Valor das sessões fechadas com saída no período.</p>
          </div>
        </>}
    </section>
  );
}
