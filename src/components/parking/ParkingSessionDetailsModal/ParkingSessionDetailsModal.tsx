import { useEffect, useRef, useState } from "react";
import { getParkingSessionById } from "../../../features/auth/services/parkingSessionService";
import type { ParkingSession } from "../../../features/auth/types/parkingSession.types";
import { formatCurrency, formatDate, formatMinutes } from "../../../features/auth/parkingSessionFormat";
import styles from "./ParkingSessionDetailsModal.module.css";

type Props = { sessionId: string; onClose: () => void };

const chargeLabels = { MINUTO: "Por minuto", HORA: "Por hora", DIARIA: "Diária", MENSAL: "Mensal" };
const statusLabels = { ABERTO: "Aberto", FECHADO: "Fechado", CANCELADO: "Cancelado" };

export function ParkingSessionDetailsModal({ sessionId, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    let active = true;
    getParkingSessionById(sessionId)
      .then((details) => { if (active) setSession(details); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [sessionId, attempt]);

  const fields = session && [
    ["Placa", session.vehicle?.placa],
    ["Situação", statusLabels[session.status]],
    ["Cliente", session.vehicle?.client?.name],
    ["Marca e modelo", [session.vehicle?.marca, session.vehicle?.modelo].filter(Boolean).join(" ")],
    ["Cor", session.vehicle?.cor],
    ["Categoria", session.vehicle?.category?.name],
    ["Vaga", session.parkingSpot?.numero],
    ["Pátio", session.parkingSpot?.patio],
    ["Entrada", formatDate(session.entrada)],
    ["Saída", formatDate(session.saida)],
    ["Duração", formatMinutes(session.tempo_total_minutos)],
    ["Cobrança", chargeLabels[session.tipo_cobranca]],
    ["Valor total", formatCurrency(session.valor_total)],
  ];

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="session-details-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header>
        <h2 id="session-details-title">Detalhes do estacionamento</h2>
        <button type="button" autoFocus onClick={onClose}>Fechar</button>
      </header>
      {failed ? (
        <div>
          <p role="alert">Não foi possível carregar os detalhes desta sessão.</p>
          <button type="button" onClick={() => { setFailed(false); setAttempt(attempt + 1); }}>
            Tentar novamente
          </button>
        </div>
      ) : fields ? (
        <dl>{fields.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>
        ))}</dl>
      ) : <p role="status">Carregando detalhes…</p>}
    </dialog>
  );
}
