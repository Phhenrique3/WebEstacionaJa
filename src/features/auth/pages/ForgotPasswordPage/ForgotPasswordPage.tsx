import type { FormEvent } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { forgotPassword } from "../../services/authService";

import styles from "./ForgotPasswordPage.module.css";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Informe o e-mail cadastrado.");
      return;
    }

    try {
      setIsLoading(true);

      await forgotPassword({
        email,
      });

      sessionStorage.setItem("@EstacioneJa:resetEmail", email);

      navigate("/reset-password", {
        state: {
          email,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        setErrorMessage(
          responseData?.message || "Não foi possível solicitar a recuperação."
        );

        return;
      }

      setErrorMessage("Erro inesperado ao solicitar recuperação de senha.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandCard}>
        <div className={styles.brandIcon}>▣</div>

        <h1>EstacioneJá</h1>

        <p>Sistema de gestão de estacionamento</p>
      </section>

      <section className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2>Recuperar senha</h2>
            <p>Informe seu e-mail para receber o código de recuperação.</p>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

          <div className={styles.fields}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar código"}
            </Button>
          </div>

          <p className={styles.backText}>
            Lembrou sua senha?{" "}
            <button type="button" onClick={() => navigate("/login")}>
              Voltar para login
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}