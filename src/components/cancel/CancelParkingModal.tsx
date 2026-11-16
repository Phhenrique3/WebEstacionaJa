import { useState } from "react";
import type { ParkingSession } from "../../features/auth/types/parkingSession.types";

import styles from "./handleCancelSession.module.css";

interface CancelParkingModalProps {
  session: ParkingSession;
  onClose: () => void;
  onConfirm: (sessionId: string) => Promise<void>;
}

export function CancelParkingModal({
  session,
  onClose,
  onConfirm,
}: CancelParkingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      await onConfirm(session.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao cancelar estacionamento."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Cancelar estacionamento</h2>

        <p>Placa: {session.vehicle?.placa ?? "-"}</p>

        <p>Cliente: {session.vehicle?.client?.name ?? "-"}</p>

        <p>Vaga: {session.parkingSpot?.numero ?? "-"}</p>

        <p>Deseja realmente cancelar esta sessão?</p>

        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Cancelando..." : "Confirmar cancelamento"}
        </button>
      </div>
    </div>
  );
}