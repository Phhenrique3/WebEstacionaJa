import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import axios from "axios";

import { Button } from "../../../../components/ui/Button";

import {
    cancelParkingSession,
    closeParkingSession,
    getParkingSessions,
    CreateParkingSession
} from "../../services/parkingSessionService";

import type {
    ParkingSession,
    ParkingSessionStatus,
    ParkingSessionChargeType
} from "../../types/parkingSession.types";




import styles from "./ParkingSessionsPage.module.css";
import { getVehicles } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle.types";

import { getParkingSpots } from "../../services/parkingSpotService";
import type { ParkingSpot } from "../../types/parkingSpotTypes";


/** Exibe, filtra e gerencia as sessões de estacionamento do pátio. */
export function ParkingSessionsPage() {




    const [sessions, setSessions] = useState<ParkingSession[]>([]);
    const [search, setSearch] = useState("");
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCreatingSession, setIsCreatingSession] = useState(false)


    const [vehicleId, setVehicleId] = useState("")
    const [parkingSpotId, setParkingSpotId] = useState("")
    const [tipoCobranca, setTipoCobranca] =
        useState<ParkingSessionChargeType>("HORA");

    const [vehicleSearch, setVehicleSearch] = useState("")
    const [spotSearch, setSpotSearch] = useState("");




    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    /** Filtra sessões por placa, cliente, vaga, pátio ou status. */
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

    /** Seleciona as sessões que ainda estão abertas. */
    const openedSessions = sessions.filter(
        (session) => session.status === "ABERTO"
    );

    /** Seleciona as sessões já encerradas. */
    const closedSessions = sessions.filter(
        (session) => session.status === "FECHADO"
    );

    /** Seleciona as sessões canceladas. */
    const canceledSessions = sessions.filter(
        (session) => session.status === "CANCELADO"
    );

    /** Mantém somente as vagas que podem receber uma nova entrada. */
    const availableParkingSpots = useMemo(() => {
        return parkingSpots.filter((spot) => spot.status === "DISPONIVEL")
    }, [parkingSpots])

    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

    const selectedParkingSpot = parkingSpots.find(
        (spot) => spot.id === parkingSpotId
    );



    /** Filtra veículos pelo texto digitado no formulário de entrada. */
    const filteredVehicles = useMemo(() => {
        const searchText = vehicleSearch.trim().toLocaleLowerCase()


        if (!searchText) {
            return vehicles
        }


        return vehicles.filter((vehicles) => {
            const placa = vehicles.placa || ""
            const modelo = vehicles.modelo || ""
            const cor = vehicles.cor || ""
            const marca = vehicles.marca || ""
            const clientName = vehicles.client?.name || ""

            return (
                placa.toLocaleLowerCase().includes(searchText) ||
                modelo.toLocaleLowerCase().includes(searchText) ||
                cor.toLocaleLowerCase().includes(searchText) ||
                marca.toLocaleLowerCase().includes(searchText) ||
                clientName.toLocaleLowerCase().includes(searchText)
            )
        })
    }, [vehicles, vehicleSearch])

    /** Filtra as vagas disponíveis pelo número ou pelo pátio. */
    const filteredParkingSpots = useMemo(() => {
        const searchText = spotSearch.trim().toLowerCase();

        if (!searchText) {
            return availableParkingSpots;
        }

        return availableParkingSpots.filter((spot) => {
            const numero = spot.numero || "";
            const patio = spot.patio || "";

            return (
                numero.toLowerCase().includes(searchText) ||
                patio.toLowerCase().includes(searchText)
            );
        });
    }, [availableParkingSpots, spotSearch]);

    /** Busca as sessões na API e atualiza o estado da tabela. */
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

    /** Busca em paralelo os veículos e as vagas usados no formulário. */
    async function loadCreateModalData() {
        try {
            const [vehicleData, parkingSpotData] = await Promise.all([
                getVehicles(),
                getParkingSpots()
            ])
            setVehicles(vehicleData);
            setParkingSpots(parkingSpotData);
        } catch {
            setErrorMessage("Erro ao carregar veículos e vagas disponíveis. ")
        }
    }

    useEffect(() => {
        loadSessions();
    }, []);

    /** Confirma e encerra uma sessão aberta, recarregando a tabela ao concluir. */
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

    /** Confirma e cancela uma sessão aberta, recarregando a tabela ao concluir. */
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

    /** Limpa o formulário, carrega seus dados e abre o modal de entrada. */
    async function handleOpenCreateModal() {
        setErrorMessage("")
        resertCreateForm()

        await loadCreateModalData()
        setIsCreateModalOpen(true)
    }

    /** Fecha o modal e restaura o formulário ao estado inicial. */
    function handleCloseCreateModal() {
        setIsCreateModalOpen(false)
        resertCreateForm()
        setErrorMessage("")
    }

    /** Valida e envia à API os dados de uma nova sessão de estacionamento. */
    async function handleCreateSession(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");

        if (!vehicleId) {
            setErrorMessage("Selecione um veículo.");
            return;
        }

        if (!parkingSpotId) {
            setErrorMessage("Selecione uma vaga disponível.");
            return;
        }

        if (!tipoCobranca) {
            setErrorMessage("Selecione o tipo de cobrança.");
            return;
        }

        try {
            setIsCreatingSession(true);

            await CreateParkingSession({
                vehicleId,
                parkingSpotId,
                tipo_cobranca: tipoCobranca,
            });

            handleCloseCreateModal();

            await loadSessions();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as { message?: string };

                setErrorMessage(responseData?.message || "Erro ao registrar entrada.");
                return;
            }

            setErrorMessage("Erro inesperado ao registrar entrada.");
        } finally {
            setIsCreatingSession(false);
        }
    }

    /** Converte o status interno da API para o texto exibido na tela. */
    function getStatusLabel(status: ParkingSessionStatus) {
        const labels = {
            ABERTO: "Aberto",
            FECHADO: "Fechado",
            CANCELADO: "Cancelado",
        };

        return labels[status];
    }

    /** Retorna a classe CSS correspondente ao status da sessão. */
    function getStatusClass(status: ParkingSessionStatus) {
        const statusClasses = {
            ABERTO: styles.statusOpened,
            FECHADO: styles.statusClosed,
            CANCELADO: styles.statusCanceled,
        };

        return statusClasses[status];
    }

    /** Formata uma data ISO para o padrão brasileiro com data e hora. */
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

    /** Converte minutos em uma duração legível em horas e minutos. */
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

    /** Converte centavos em moeda brasileira para exibição. */
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


    /** Limpa as seleções e buscas do formulário de registro de entrada. */
    function resertCreateForm() {
        setVehicleId("")
        setParkingSpotId("")
        setTipoCobranca("HORA")
        setVehicleSearch("")
        setSpotSearch("")


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
            {isCreateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <header className={styles.modalHeader}>
                            <div>
                                <h2>Registrar Entrada</h2>
                                <p>Selecione o veículo, a vaga disponível e o tipo de cobrança.</p>
                            </div>

                            <button type="button" onClick={handleCloseCreateModal}>
                                ×
                            </button>
                        </header>

                        <form onSubmit={handleCreateSession} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="vehicleSearch">Veículo</label>

                                <input
                                    id="vehicleSearch"
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Pesquisar por placa, cliente, marca ou modelo..."
                                    value={vehicleSearch}
                                    onChange={(event) => {
                                        setVehicleSearch(event.target.value);
                                        setVehicleId("");
                                    }}
                                />

                                <select
                                    id="vehicleId"
                                    value={vehicleId}
                                    onChange={(event) => setVehicleId(event.target.value)}
                                >
                                    <option value="">Selecione um veículo</option>

                                    {filteredVehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                                            {vehicle.client?.name ? ` - ${vehicle.client.name}` : ""}
                                        </option>
                                    ))}
                                </select>

                                <small>{filteredVehicles.length} veículo(s) encontrado(s)</small>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="spotSearch">Vaga disponível</label>

                                <input
                                    id="spotSearch"
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Pesquisar por número da vaga ou pátio..."
                                    value={spotSearch}
                                    onChange={(event) => {
                                        setSpotSearch(event.target.value);
                                        setParkingSpotId("");
                                    }}
                                />

                                <select
                                    id="parkingSpotId"
                                    value={parkingSpotId}
                                    onChange={(event) => setParkingSpotId(event.target.value)}
                                >
                                    <option value="">Selecione uma vaga disponível</option>

                                    {filteredParkingSpots.map((spot) => (
                                        <option key={spot.id} value={spot.id}>
                                            {spot.numero} - {spot.patio || "Sem pátio"}
                                        </option>
                                    ))}
                                </select>

                                <small>
                                    {filteredParkingSpots.length} vaga(s) disponível(is)
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="tipoCobranca">Tipo de cobrança</label>

                                <select
                                    id="tipoCobranca"
                                    value={tipoCobranca}
                                    onChange={(event) =>
                                        setTipoCobranca(
                                            event.target.value as ParkingSessionChargeType
                                        )
                                    }
                                >
                                    <option value="HORA">Hora</option>
                                    <option value="MINUTO">Minuto</option>
                                    <option value="DIARIA">Diária</option>
                                    <option value="MENSAL">Mensal</option>
                                </select>
                            </div>

                            <div className={styles.summaryBox}>
                                <strong>Prévia da entrada</strong>

                                <p>
                                    Veículo:{" "}
                                    {selectedVehicle
                                        ? `${selectedVehicle.placa} - ${selectedVehicle.marca} ${selectedVehicle.modelo}`
                                        : "Nenhum veículo selecionado"}
                                </p>

                                <p>
                                    Vaga:{" "}
                                    {selectedParkingSpot
                                        ? `${selectedParkingSpot.numero} - ${selectedParkingSpot.patio || "Sem pátio"
                                        }`
                                        : "Nenhuma vaga selecionada"}
                                </p>

                                <p>Tipo de cobrança: {tipoCobranca}</p>
                                <p>Status inicial: ABERTO</p>
                            </div>

                            <div className={styles.modalActions}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseCreateModal}
                                >
                                    Cancelar
                                </Button>

                                <Button type="submit" disabled={isCreatingSession}>
                                    {isCreatingSession ? "Salvando..." : "Salvar Entrada"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );

}