import { useState } from "react";
import type { FormEvent } from "react";
import type { LoggedUser } from "../../types";
import { loginUser } from "../../services/loginApi";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: (user: LoggedUser) => void;
  onGoToSignup: () => void;
}

export function LoginPage({ onLogin, onGoToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setErrorMessage(null);

  if (!email.trim() || !password.trim()) {
    setErrorMessage("Preencha todos os campos obrigatórios");
    return;
  }

  setIsLoading(true);

  try {
    const user = await loginUser(email, password);
    onLogin(user);
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "E-mail ou senha inválidos",
    );
  } finally {
    setIsLoading(false);
  }
}

  return (
    <main className="login-page">
      <section className="login-main-container">
        <div className="login-card">
          <div className="login-logo-section">
            <img
              alt="Cinema Logo"
              className="login-logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0AmOoIo4aiNnKc8rSqXogAavi-EKdqUF0VMXjyMrSKFAOOUD8bSg7nsGhEFS81egGU0cLrqlGK_HR2bWJ3AQlPqu-KiiHQbCBpBGOnn6OaRbDfDKGYW-KJbjrfjFCDsqKMke2XmBXIltnPzFHXru7DxBAcCgrCOsZFNMngJl5z9qxrBmOB0cptFpjcwJbe1ToZ7YG5a-yG7ShNVMMlvqrn254yH-D1Ket1-yGsZnf8aONa-YWiOWleSnELtRQFJd5N1utSPrGIQY"
            />
          </div>

          <h1>Acesse sua conta</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">E-mail</label>

              <div className="login-input-wrapper">
                <span className="material-symbols-outlined login-input-icon">
                  alternate_email
                </span>

                <input
                  id="email"
                  name="email"
                  placeholder="nome@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>

              <div className="login-input-wrapper">
                <span className="material-symbols-outlined login-input-icon">
                  lock
                </span>

                <input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="login-forgot-password">
                <a href="#">Esqueceu a senha?</a>
              </div>
            </div>

            {errorMessage && <p className="login-error">{errorMessage}</p>}

            <button
              className="login-primary-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "ENTRANDO..." : "ENTRAR"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <div className="login-divider">
              <div />
              <span>Ou continue com</span>
              <div />
            </div>

            <button className="login-google-button" type="button">
              <svg className="login-google-icon" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="currentColor"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="currentColor"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="currentColor"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="currentColor"
                />
              </svg>

              Entrar com Google
            </button>
          </form>

          <div className="login-signup">
            <p>
              Não tem uma conta?{" "}
              <button type="button" onClick={onGoToSignup}>
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}