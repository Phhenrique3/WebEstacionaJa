import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import {
  createParkingSpot,
  getParkingSpots,
} from "../../services/parkingSpotService";

import type {
  ParkingSpot,
  ParkingSpotStatus,
} from "../../types/parkingSpotTypes";

import styles from "./ParkingSpotsPage.module.css";

export function ParkingSpotsPage() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [search, setSearch] = useState("");

  const [numero, setNumero] = useState("");
  const [patio, setPatio] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const filteredSpots = useMemo(() => {
    const searchText = search.toLowerCase();

    return spots.filter((spot) => {
      return (
        spot.numero.toLowerCase().includes(searchText) ||
        (spot.patio || "").toLowerCase().includes(searchText) ||
        spot.status.toLowerCase().includes(searchText)
      );
    });
  }, [spots, search]);

  async function loadSpots() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getParkingSpots();

      setSpots(data);
    } catch {
      setErrorMessage("Erro ao carregar vagas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSpots();
  }, []);

  function openCreateModal() {
    setNumero("");
    setPatio("");
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setNumero("");
    setPatio("");
    setErrorMessage("");
  }

  async function handleCreateSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!numero.trim()) {
      setErrorMessage("Informe o número da vaga.");
      return;
    }

    try {
      setIsSaving(true);

      await createParkingSpot({
        numero,
        patio: patio || undefined,
      });

      closeModal();

      await loadSpots();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        setErrorMessage(responseData?.message || "Erro ao criar vaga.");
        return;
      }

      setErrorMessage("Erro inesperado ao criar vaga.");
    } finally {
      setIsSaving(false);
    }
  }

  function getStatusLabel(status: ParkingSpotStatus) {
    const labels = {
      DISPONIVEL: "Disponível",
      OCUPADA: "Ocupada",
      RESERVADA: "Reservada",
      INATIVA: "Inativa",
    };

    return labels[status] || status;
  }

  function getStatusClass(status: ParkingSpotStatus) {
    const statusClasses = {
      DISPONIVEL: styles.statusAvailable,
      OCUPADA: styles.statusOccupied,
      RESERVADA: styles.statusReserved,
      INATIVA: styles.statusInactive,
    };

    return statusClasses[status] || styles.statusInactive;
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Vagas</h1>
          <p>Gerencie as vagas disponíveis no estacionamento.</p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          + Nova Vaga
        </Button>
      </header>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Total de vagas</span>
          <strong>{spots.length}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Disponíveis</span>
          <strong>
            {spots.filter((spot) => spot.status === "DISPONIVEL").length}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Ocupadas</span>
          <strong>
            {spots.filter((spot) => spot.status === "OCUPADA").length}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Reservadas</span>
          <strong>
            {spots.filter((spot) => spot.status === "RESERVADA").length}
          </strong>
        </div>
      </div>

      <div className={styles.searchBox}>
        <span>🔎</span>

        <input
          type="text"
          placeholder="Buscar por número, pátio ou status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando vagas...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Pátio</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>

            <tbody>
              {filteredSpots.map((spot) => (
                <tr key={spot.id}>
                  <td>{spot.numero}</td>
                  <td>{spot.patio || "-"}</td>
                  <td>
                    <span className={getStatusClass(spot.status)}>
                      {getStatusLabel(spot.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(spot.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}

              {filteredSpots.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyMessage}>
                    Nenhuma vaga encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <h2>Nova Vaga</h2>
                <p>Cadastre uma vaga para o estacionamento.</p>
              </div>

              <button type="button" onClick={closeModal}>
                ×
              </button>
            </header>

            <form onSubmit={handleCreateSpot} className={styles.form}>
              <Input
                label="Número da vaga"
                name="numero"
                type="text"
                placeholder="Ex: A01"
                value={numero}
                onChange={(event) => setNumero(event.target.value)}
              />

              <Input
                label="Pátio"
                name="patio"
                type="text"
                placeholder="Ex: Pátio 1"
                value={patio}
                onChange={(event) => setPatio(event.target.value)}
              />

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}