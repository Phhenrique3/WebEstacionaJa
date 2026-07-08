import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

export function LoginPage() {
  return (
    <main>
      <h1>Tela de Login</h1>

      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="seu@email.com"
      />

      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="Digite sua senha"
      />

      <Button type="submit" fullWidth>
        Entrar
      </Button>
    </main>
  );
}