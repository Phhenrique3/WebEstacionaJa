import type { FormEvent } from "react";
import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { login } from "../../services/authService";

import styles from "./LoginPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Informe o e-mail.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Informe a senha.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await login({
        email,
        password,
      });

      localStorage.setItem("@EstacioneJa:token", response.token);
      localStorage.setItem("@EstacioneJa:user", JSON.stringify(response.user));

      navigate("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "E-mail ou senha inválidos.";

        setErrorMessage(message);
        return;
      }

      setErrorMessage("Erro inesperado ao tentar fazer login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.brandCard}>
        <div className={styles.brandIcon}>▣</div>

        <h1>EstacioneJá</h1>

        <p>Sistema de gestão de estacionamento</p>
      </section>

      <section className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2>Entrar</h2>
            <p>Acesse sua conta para continuar</p>
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

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              <span>Lembrar-me</span>
            </label>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => navigate("/forgot-password")}
            >
              Esqueceu sua senha?
            </button>
          </div>

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>


        </form>
      </section>
    </main>
  );
}