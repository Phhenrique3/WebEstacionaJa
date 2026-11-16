
import { useRef, useState } from "react";
import type { MetodoPagamento } from "../../../features/auth/types/payment.types";
import styles from "./PaymentModal.module.css";

export interface ParkingSessionForPayment {
    id: string;
    status: string;
    entrada: string;
    saida?: string | null;
    valor_total?: string | number | null;
    tempo_total_minutos?: number | null;

    vehicle: {
        placa: string;
        marca: string;
        modelo: string;
    };
}

interface PaymentModalProps {
    session: ParkingSessionForPayment;
    onClose: () => void;

    onCloseSession: (
        id: string
    ) => Promise<ParkingSessionForPayment>;

    onConfirmPayment: (
        sessionId: string,
        metodo: MetodoPagamento
    ) => Promise<void>;

    onSuccess: () => void | Promise<void>;
}

function formatCurrency(value: number | string): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value));
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(date));
}

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = error.response as {
            data?: {
                mensagem?: string;
                message?: string;
            };
        };

        return (
            response.data?.mensagem ??
            response.data?.message ??
            "Não foi possível concluir a operação."
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocorreu um erro inesperado.";
}

export function PaymentModal({
    session,
    onClose,
    onCloseSession,
    onConfirmPayment,
    onSuccess,
}: PaymentModalProps) {
    const [metodoPagamento, setMetodoPagamento] =
        useState<MetodoPagamento>("PIX");

    const [closedSession, setClosedSession] =
        useState<ParkingSessionForPayment | null>(
            session.status === "FECHADO" ? session : null
        );

    const [loading, setLoading] = useState(false);
    const [paymentRegistered, setPaymentRegistered] =
        useState(false);
    const [error, setError] = useState("");
    const operationLock = useRef(false);

    const currentSession = closedSession ?? session;
    const isClosed = currentSession.status === "FECHADO";

    const hasAmount =
        currentSession.valor_total !== null &&
        currentSession.valor_total !== undefined &&
        Number.isFinite(Number(currentSession.valor_total));

    async function handleCloseSession() {
        if (operationLock.current || isClosed) return;

        operationLock.current = true;
        setLoading(true);
        setError("");

        try {
            const result = await onCloseSession(session.id);

            if (result.status !== "FECHADO") {
                throw new Error(
                    "O backend não confirmou o fechamento."
                );
            }

            setClosedSession({
                ...session,
                ...result,
                vehicle: result.vehicle ?? session.vehicle,
            });
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            operationLock.current = false;
            setLoading(false);
        }
    }

    async function handlePayment() {
        if (
            operationLock.current ||
            !isClosed ||
            !hasAmount ||
            paymentRegistered
        ) {
            return;
        }

        operationLock.current = true;
        setLoading(true);
        setError("");

        try {
            await onConfirmPayment(
                currentSession.id,
                metodoPagamento
            );

            setPaymentRegistered(true);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            operationLock.current = false;
            setLoading(false);
        }
    }

    async function handleFinish() {
        if (operationLock.current) return;

        operationLock.current = true;
        setLoading(true);
        setError("");

        try {
            await onSuccess();
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            operationLock.current = false;
            setLoading(false);
        }
    }

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
            >
                <header className={styles.header}>
                    <div>
                        <h2 id="payment-modal-title">
                            Fechamento de estacionamento
                        </h2>
                        <p>Confira os dados da permanência</p>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Fechar modal"
                    >
                        ×
                    </button>
                </header>

                <section className={styles.vehicleInfo}>
                    <div className={styles.infoItem}>
                        <span>Placa</span>
                        <strong>{session.vehicle.placa}</strong>
                    </div>

                    <div className={styles.infoItem}>
                        <span>Veículo</span>
                        <strong>
                            {session.vehicle.marca}{" "}
                            {session.vehicle.modelo}
                        </strong>
                    </div>

                    <div className={styles.infoItem}>
                        <span>Entrada</span>
                        <strong>{formatDate(session.entrada)}</strong>
                    </div>

                    <div className={styles.infoItem}>
                        <span>Status</span>
                        <strong>
                            {paymentRegistered
                                ? "Pagamento registrado"
                                : isClosed
                                    ? "Fechado"
                                    : "Aberto"}
                        </strong>
                    </div>
                </section>

                {!isClosed ? (
                    <section className={styles.actions}>
                        <p className={styles.description}>
                            Ao confirmar a sessão
                            e calculará o valor total da permanência.
                        </p>

                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleCloseSession}
                            disabled={loading}
                        >
                            {loading
                                ? "Fechando estacionamento..."
                                : "Confirmar fechamento"}
                        </button>
                    </section>
                ) : (
                    <>
                        <section className={styles.amountBox}>
                            <span>Valor total a pagar</span>

                            <strong>
                                {hasAmount
                                    ? formatCurrency(
                                        currentSession.valor_total as string | number
                                    )
                                    : "Valor indisponível"}
                            </strong>

                            <small>
                                Tempo estacionado:{" "}
                                {currentSession.tempo_total_minutos ?? 0}{" "}
                                minutos
                            </small>
                        </section>

                        {!paymentRegistered ? (
                            <section className={styles.paymentSection}>
                                <label htmlFor="payment-method">
                                    Forma de pagamento
                                </label>

                                <select
                                    id="payment-method"
                                    value={metodoPagamento}
                                    onChange={(event) =>
                                        setMetodoPagamento(
                                            event.target.value as MetodoPagamento
                                        )
                                    }
                                    disabled={loading}
                                >
                                    <option value="PIX">PIX</option>
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="CREDITO">
                                        Cartão de crédito
                                    </option>
                                    <option value="DEBITO">
                                        Cartão de débito
                                    </option>
                                </select>

                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handlePayment}
                                    disabled={loading || !hasAmount}
                                >
                                    {loading
                                        ? "Registrando pagamento..."
                                        : "Confirmar pagamento"}
                                </button>
                            </section>
                        ) : (
                            <section className={styles.successBox}>
                                <strong>
                                    Pagamento registrado com sucesso!
                                </strong>

                                <p>
                                    O pagamento foi salvo no sistema.
                                </p>

                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handleFinish}
                                    disabled={loading}
                                >
                                    {loading ? "Atualizando..." : "Concluir"}
                                </button>
                            </section>
                        )}
                    </>
                )}

                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                {!paymentRegistered && !loading && (
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        {isClosed ? "Fechar modal" : "Cancelar"}
                    </button>
                )}
            </div>
        </div>
    );
}
