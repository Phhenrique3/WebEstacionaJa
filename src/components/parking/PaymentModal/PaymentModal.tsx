
import { useRef, useState } from "react";
import type { MetodoPagamento } from "../../../features/auth/types/payment.types";
import styles from "./PaymentModal.module.css";

/**
 * Representa os dados da sessão de estacionamento utilizados no fechamento
 * e no registro do pagamento.
 *
 * Os campos relacionados ao encerramento são opcionais porque a sessão pode
 * ser aberta no momento em que o modal é exibido.
 */
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

/**
 * Contrato de comunicação entre o modal e o componente que o utiliza.
 *
 * As operações de fechamento e pagamento são delegadas ao componente pai,
 * permitindo que este componente cuide apenas da apresentação e do fluxo
 * visual da operação.
 */
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

/**
 * Formata um valor numérico como moeda brasileira.
 *
 * @param value Valor recebido como número ou texto numérico.
 * @returns Valor formatado no padrão brasileiro, por exemplo, "R$ 12,50".
 */
function formatCurrency(value: number | string): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value));
}

/**
 * Converte uma data em texto para o formato curto de data e hora usado no
 * padrão brasileiro.
 *
 * @param date Data em formato aceito pelo construtor nativo `Date`.
 * @returns Data formatada conforme o fuso horário do ambiente do navegador.
 */
function formatDate(date: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(date));
}

/**
 * Obtém uma mensagem amigável a partir dos formatos de erro utilizados pela
 * aplicação e pelo cliente HTTP.
 *
 * A função prioriza mensagens retornadas pelo backend, depois mensagens de
 * instâncias nativas de `Error` e, por fim, utiliza uma mensagem genérica.
 *
 * @param error Erro capturado por uma operação assíncrona.
 * @returns Mensagem que pode ser exibida ao usuário.
 */
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
    /**
     * Método de pagamento selecionado pelo usuário. PIX é o método inicial.
     */
    const [metodoPagamento, setMetodoPagamento] =
        useState<MetodoPagamento>("PIX");

    /**
     * Sessão retornada pelo backend após o fechamento. Quando a sessão já
     * chega fechada, os dados recebidos inicialmente são utilizados.
     */
    const [closedSession, setClosedSession] =
        useState<ParkingSessionForPayment | null>(
            session.status === "FECHADO" ? session : null
        );

    /** Indica que uma operação assíncrona está em andamento. */
    const [loading, setLoading] = useState(false);

    /**
     * Indica que o pagamento foi confirmado pelo backend e que o fluxo pode
     * ser finalizado pelo usuário.
     */
    const [paymentRegistered, setPaymentRegistered] =
        useState(false);

    /** Mensagem de erro apresentada no próprio modal. */
    const [error, setError] = useState("");

    /**
     * Impede chamadas duplicadas causadas por cliques repetidos enquanto uma
     * operação assíncrona ainda não terminou.
     */
    const operationLock = useRef(false);

    /** Dados efetivamente utilizados pela etapa atual do fluxo. */
    const currentSession = closedSession ?? session;

    /** Define se a etapa de fechamento já foi concluída. */
    const isClosed = currentSession.status === "FECHADO";

    /**
     * Indica se o valor retornado pela sessão pode ser usado para registrar o
     * pagamento.
     */
    const hasAmount =
        currentSession.valor_total !== null &&
        currentSession.valor_total !== undefined &&
        Number.isFinite(Number(currentSession.valor_total));

    /**
     * Fecha a sessão de estacionamento e atualiza o modal com os dados
     * calculados pelo backend, como valor total e tempo de permanência.
     *
     * A operação é ignorada quando já existe outra operação em andamento ou
     * quando a sessão já está fechada.
     */
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

    /**
     * Registra o pagamento da sessão fechada usando o método selecionado.
     *
     * O registro só é iniciado quando a sessão está fechada, possui valor
     * válido e ainda não teve um pagamento confirmado.
     */
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

    /**
     * Executa a ação final fornecida pelo componente pai depois que o
     * pagamento foi registrado, normalmente para atualizar a listagem e
     * encerrar o modal.
     */
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
                {/* Cabeçalho: identifica o fluxo e oferece o fechamento manual. */}
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

                {/* Resumo: exibe os dados da sessão e o status atual do fluxo. */}
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

                {/* Etapa 1: sessão aberta; solicita o fechamento e o cálculo. */}
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
                        {/* Etapa 2: sessão fechada; exibe o valor e a duração. */}
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

                        {/* Etapa 3: coleta o método e registra o pagamento. */}
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
                            /* Etapa 4: confirma o pagamento e permite concluir. */
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

                {/* Feedback de erro: informa falhas nas operações assíncronas. */}
                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                {/* Ação secundária: permite cancelar ou fechar antes da conclusão. */}
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
