import { Pagination } from "../../../../components/pagination/Pagination";
import { usePagedList } from "../../../../components/pagination/usePagedList";
import type { FormEvent } from "react";
import { useState } from "react";
import axios from "axios";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

import {
  createParkingSpot,

  DeleteSpot,
  UpdateParking,
} from "../../services/parkingSpotService";

import type {
  ParkingSpot,
  ParkingSpotStatus,
} from "../../types/parkingSpotTypes";

type ModalMode = "create" | "edit";

import styles from "./ParkingSpotsPage.module.css";

export function ParkingSpotsPage() {
  const list = usePagedList<ParkingSpot>("/parking-spots");
  const { search, setSearch, loading: isLoading, items: filteredSpots } = list;

  const [numero, setNumero] = useState("");
  const [patio, setPatio] = useState("");


  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  function closeModal() {
    setIsModalOpen(false);
    setSelectedSpotId(null);
    setNumero("");
    setPatio("");
    setErrorMessage("");
  }

  async function handleSaveSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!numero.trim()) {
      setErrorMessage("Informe o número da vaga.");
      return;
    }

    try {
      setIsSaving(true);

      if (modalMode === "edit" && selectedSpotId) {
        await UpdateParking(selectedSpotId, {
          numero,
          patio: patio || undefined,
        });
      } else {
        await createParkingSpot({
          numero,
          patio: patio || undefined,
        });
      }

      closeModal();
      list.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        const defaultMessage =
          modalMode === "edit" ? "Erro ao atualizar vaga." : "Erro ao criar vaga.";

        setErrorMessage(responseData?.message || defaultMessage);
        return;
      }

      setErrorMessage(
        modalMode === "edit" ? "Erro inesperado ao atualizar vaga." : "Erro inesperado ao criar vaga.",
      );
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

  function resetForm() {
    setNumero("")
    setPatio("")
  }
  function openCreateModal() {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  }
  function openEditModal(spot: ParkingSpot) {
    setSelectedSpotId(spot.id);
    setNumero(spot.numero);
    setPatio(spot.patio ?? "");
    setModalMode("edit");
    setIsModalOpen(true);
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

  async function handleDeleteStop(spot: ParkingSpot) {
    const confirmDelete = window.confirm(
      `Deseja realmente remover a vaga ${spot.numero}?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setErrorMessage("");
      await DeleteSpot(spot.id);

      list.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };
        setErrorMessage(responseData?.message || "Erro ao remover vaga.");
        return;
      }

      setErrorMessage("Erro inesperado ao remover vaga.");
    }
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

      {(errorMessage || list.error) && (
        <div className={styles.errorMessage}>{errorMessage || list.error}</div>
      )}

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Total de vagas</span>
          <strong>{list.summary?.total ?? 0}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Disponíveis</span>
          <strong>
            {list.summary?.DISPONIVEL ?? 0}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Ocupadas</span>
          <strong>
            {list.summary?.OCUPADA ?? 0}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Reservadas</span>
          <strong>
            {list.summary?.RESERVADA ?? 0}
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
                    <div className={styles.tableCellActions}>
                      <span>{new Date(spot.createdAt).toLocaleDateString("pt-BR")}</span>


                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => openEditModal(spot)}
                          title="Editar vaga"
                          aria-label={`Editar vaga ${spot.numero}`}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStop(spot)}
                          title="Excluir vaga"
                          aria-label={`Excluir vaga ${spot.numero}`}
                        >
                          🗑
                        </button>

                      </div>

                    </div>
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
      <Pagination {...list} label="Paginação de vagas" />

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <h2>{modalMode === "edit" ? "Editar vaga" : "Nova Vaga"}</h2>
                <p>
                  {modalMode === "edit"
                    ? "Atualize os dados da vaga selecionada."
                    : "Cadastre uma vaga para o estacionamento."}
                </p>
              </div>

              <button type="button" onClick={closeModal} aria-label="Fechar modal">
                ×
              </button>
            </header>

            <form onSubmit={handleSaveSpot} className={styles.form}>
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
                  {isSaving
                    ? modalMode === "edit"
                      ? "Salvando alterações..."
                      : "Salvando..."
                    : modalMode === "edit"
                      ? "Salvar alterações"
                      : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}