import { useEffect, useMemo, useState } from "react";
import { getParkingSessions } from "../../../auth/services/parkingSessionService";
import type { ParkingSession } from "../../../auth/types/parkingSession.types";

import styles from "./DashboardOverviewPage.module.css"


export function DashboardOverviewPage() {
    const [sessions, setSessions] = useState<ParkingSession[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");

        return `${year}-${month}`;
    });


    const [errorMessage, setErrorMessage] = useState("")


    async function loadDashboard() {
        try {
            setIsLoading(true);
            setErrorMessage("")

            const data = await getParkingSessions()

            setSessions(data)
        } catch {
            setErrorMessage("Erro ao carregar dados do dashboard ")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])


    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => {
            const entryDate = new Date(session.entrada);

            if (Number.isNaN(entryDate.getTime())) {
                return false;
            }

            const year = entryDate.getFullYear();

            const month = String(
                entryDate.getMonth() + 1
            ).padStart(2, "0");

            const sessionMonth = `${year}-${month}`;

            return sessionMonth === selectedMonth;
        });
    }, [sessions, selectedMonth]);

    const openedSessions = filteredSessions.filter(
        (session) => session.status === "ABERTO"
    );

    const closedSessions = filteredSessions.filter(
        (session) => session.status === "FECHADO"
    )

    const canceledSessions = filteredSessions.filter(
        (session) => session.status === "CANCELADO"
    )

    return (
        <section className={styles.page}>
            <h1>Dashboard do estacionamento</h1>

            <p>Acompanhe os indicadores do estacionamento.</p>

            <div className={styles.filterBox}>
                <label htmlFor="selectedMonth">
                    Filtrar por mês
                </label>

                <input
                    id="selectedMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => {
                        setSelectedMonth(event.target.value);
                    }}
                />
            </div>

            {isLoading && <p>Carregando dados...</p>}

            {errorMessage && <p>{errorMessage}</p>}

            {!isLoading && !errorMessage && (
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <span>Entradas no mês</span>
                        <strong>{filteredSessions.length}</strong>
                    </div>

                    <div className={styles.card}>
                        <span>Sessões abertas</span>
                        <strong>{openedSessions.length}</strong>
                    </div>

                    <div className={styles.card}>
                        <span>Sessões fechadas</span>
                        <strong>{closedSessions.length}</strong>
                    </div>

                    <div className={styles.card}>
                        <span>Sessões canceladas</span>
                        <strong>{canceledSessions.length}</strong>
                    </div>
                </div>
            )}
        </section>
    );

}