import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { resetPassword } from "../../services/authService";

import styles from "./ResetPasswordPage.module.css";

type ResetPasswordLocationState = {
  email?: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as ResetPasswordLocationState | null;

  const initialEmail =
    locationState?.email ||
    sessionStorage.getItem("@EstacioneJa:resetEmail") ||
    "";

  const [email] = useState(initialEmail);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!initialEmail) {
      navigate("/forgot-password");
    }
  }, [initialEmail, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!token.trim()) {
      setErrorMessage("Informe o código de verificação.");
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage("Informe a nova senha.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword({
        email,
        token,
        newPassword,
      });

      sessionStorage.removeItem("@EstacioneJa:resetEmail");

      alert("Senha redefinida com sucesso.");

      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string };

        setErrorMessage(
          responseData?.message || "Token inválido ou expirado."
        );

        return;
      }

      setErrorMessage("Erro inesperado ao redefinir senha.");
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
            <h2>Nova senha</h2>
            <p>Informe o código recebido e defina sua nova senha.</p>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

          <div className={styles.fields}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={email}
              readOnly
            />

            <Input
              label="Token/Código de verificação"
              name="token"
              type="text"
              placeholder="Digite o código recebido"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />

            <Input
              label="Nova senha"
              name="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
          </div>

          <p className={styles.backText}>
            <button type="button" onClick={() => navigate("/login")}>
              Voltar para login
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}