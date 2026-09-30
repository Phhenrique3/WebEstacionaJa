import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";

import {
    cancelParkingSession,
    closeParkingSession,
    getParkingSessions,
} from "../../services/parkingSessionService";

import type {
    ParkingSession,
    ParkingSessionStatus
} from "../../types/parkingSession.types";

import styles from "./ParkingSessionsPage.module.css";

export function ParkingSessionsPage() {
    const [sessions, setSessions] = useState<ParkingSession[]>([]);
    const [search, setSearch] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const filteredSessions = useMemo(() => {
        const searchText = search.toLowerCase();

        return sessions.filter((session) => {
            const plate = session.vehicle?.placa || "";
            const clientName = session.vehicle?.client?.name || "";
            const spotNumber = session.parkingSpot?.numero || "";
            const patio = session.parkingSpot?.patio || "";

            return (
                plate.toLowerCase().includes(searchText) ||
                clientName.toLowerCase().includes(searchText) ||
                spotNumber.toLowerCase().includes(searchText) ||
                patio.toLowerCase().includes(searchText) ||
                session.status.toLowerCase().includes(searchText)
            );
        });
    }, [sessions, search]);

    const openedSessions = sessions.filter(
        (session) => session.status === "ABERTO"
    );

    const closedSessions = sessions.filter(
        (session) => session.status === "FECHADO"
    );

    const canceledSessions = sessions.filter(
        (session) => session.status === "CANCELADO"
    );

    async function loadSessions() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const data = await getParkingSessions();

            setSessions(data);
        } catch {
            setErrorMessage("Erro ao carregar sessões de estacionamento.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadSessions();
    }, []);

    async function handleCloseSession(sessionId: string) {
        const confirmClose = window.confirm("Deseja realmente fechar esta sessão?");

        if (!confirmClose) {
            return;
        }

        try {
            setIsActionLoading(true);
            setErrorMessage("");

            await closeParkingSession(sessionId);

            await loadSessions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as { message?: string };

                setErrorMessage(responseData?.message || "Erro ao fechar sessão.");
                return;
            }

            setErrorMessage("Erro inesperado ao fechar sessão.");
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleCancelSession(sessionId: string) {
        const confirmCancel = window.confirm(
            "Deseja realmente cancelar esta sessão?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setIsActionLoading(true);
            setErrorMessage("");

            await cancelParkingSession(sessionId);

            await loadSessions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as { message?: string };

                setErrorMessage(responseData?.message || "Erro ao cancelar sessão.");
                return;
            }

            setErrorMessage("Erro inesperado ao cancelar sessão.");
        } finally {
            setIsActionLoading(false);
        }
    }

    function handleOpenCreateModal() {
        alert("No próximo passo vamos criar o modal de Registrar Entrada.");
    }

    function getStatusLabel(status: ParkingSessionStatus) {
        const labels = {
            ABERTO: "Aberto",
            FECHADO: "Fechado",
            CANCELADO: "Cancelado",
        };

        return labels[status];
    }

    function getStatusClass(status: ParkingSessionStatus) {
        const statusClasses = {
            ABERTO: styles.statusOpened,
            FECHADO: styles.statusClosed,
            CANCELADO: styles.statusCanceled,
        };

        return statusClasses[status];
    }

    function formatDate(dateValue: string | null) {
        if (!dateValue) {
            return "-";
        }

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateValue));
    }

    function formatMinutes(minutes: number | null) {
        if (!minutes) {
            return "-";
        }

        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${remainingMinutes}min`;
    }

    function formatCurrency(value: string | number | null) {
        if (value === null || value === undefined) {
            return "-";
        }

        const numericValue = Number(value);

        if (Number.isNaN(numericValue)) {
            return "-";
        }

        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(numericValue / 100);
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Sessões de Estacionamento</h1>
                    <p>Controle de entradas, saídas, cancelamentos e valores em aberto.</p>
                </div>

                <Button type="button" onClick={handleOpenCreateModal}>
                    + Registrar Entrada
                </Button>
            </header>

            {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span>Sessões abertas</span>
                    <strong>{openedSessions.length}</strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Fechadas</span>
                    <strong>{closedSessions.length}</strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Canceladas</span>
                    <strong>{canceledSessions.length}</strong>
                </div>

                <div className={styles.summaryCard}>
                    <span>Total de sessões</span>
                    <strong>{sessions.length}</strong>
                </div>
            </div>

            <div className={styles.searchBox}>
                <span>🔎</span>

                <input
                    type="text"
                    placeholder="Buscar por placa, cliente, vaga ou status..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <div className={styles.tableCard}>
                {isLoading ? (
                    <p className={styles.loadingText}>Carregando sessões...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Cliente</th>
                                <th>Veículo</th>
                                <th>Vaga</th>
                                <th>Entrada</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Tempo</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSessions.map((session) => (
                                <tr key={session.id}>
                                    <td>{session.vehicle?.placa || "-"}</td>

                                    <td>{session.vehicle?.client?.name || "-"}</td>

                                    <td>
                                        {session.vehicle
                                            ? `${session.vehicle.marca} ${session.vehicle.modelo}`
                                            : "-"}
                                    </td>

                                    <td>
                                        {session.parkingSpot
                                            ? `${session.parkingSpot.numero} - ${session.parkingSpot.patio || "Sem pátio"
                                            }`
                                            : "-"}
                                    </td>

                                    <td>{formatDate(session.entrada)}</td>

                                    <td>{session.tipo_cobranca}</td>

                                    <td>
                                        <span className={getStatusClass(session.status)}>
                                            {getStatusLabel(session.status)}
                                        </span>
                                    </td>

                                    <td>{formatMinutes(session.tempo_total_minutos)}</td>

                                    <td>{formatCurrency(session.valor_total)}</td>

                                    <td>
                                        <div className={styles.actions}>
                                            {session.status === "ABERTO" ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCloseSession(session.id)}
                                                        disabled={isActionLoading}
                                                    >
                                                        Fechar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelSession(session.id)}
                                                        disabled={isActionLoading}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <button type="button">Detalhes</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredSessions.length === 0 && (
                                <tr>
                                    <td colSpan={10} className={styles.emptyMessage}>
                                        Nenhuma sessão encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}