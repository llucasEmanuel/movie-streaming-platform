import "./WelcomePage.css";

interface WelcomePageProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
}

export function WelcomePage({ onGoToLogin, onGoToSignup }: WelcomePageProps) {
  return (
    <div className="welcome-page">
      <div className="welcome-background">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIh9WC0woRdwt_kyNODtkzKBggnyNbv9bNZ_OxIOG8QYg198q2ULMJV6xeq9_8vP5_rh-Y7-ELsvJLoidIan83AEWGpweil9deFL_DrARi__5InNeYGIaGGPajgw29JGyFIRTTvhWJRifnyZES3p9exk0tuqOA0OREZ6lORu0dbPoQ1wsAE2ZjGTWXEnWsp9v8OMh7gbQRMeSXXqqz9XoXSCirTdf-8jCIvEQkyvHmgUtNMIKqWOYju5jw4rbj1eOw5jnRYRD2qEQ"
          alt=""
          className="welcome-background-image"
        />
        <div className="welcome-gradient" />
        <div className="welcome-film-grain" />
      </div>

      <main className="welcome-main">
        <section className="welcome-card">
          <div className="welcome-accent" />

          <div className="welcome-logo-wrapper">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0GsIOH1UMGOqy6qvnlTGzdDZgATTeIlm8ZJj75Rxo7oB1ol8CyBoTdj8Tw6qE2hKaYJvHml0TeR-kZuzFEwvbfZmg5wJAvyDpy6g1FaK5lnhAdd1g50y63jC1V_q8peciZbn4c2qNCMvvlfDfC-8qJSzyrprte-LtaPtTTP73-6mGLwyvSfgwTnnYxONKKs8rhPSqjMHQtXqh8z9swLTK6Lfgi4HSK4UdMVnGvoOsoYSPmSTOsYedx-SSabxNlx2qhQvS1_OXTVw"
              alt="CINema Logo"
              className="welcome-logo"
            />
          </div>

          <div className="welcome-text">
            <h2>O melhor do Cinema Clássico na sua tela</h2>

            <p>
              Sua plataforma definitiva para explorar clássicos e raridades do
              cinema antigo. Mergulhe na nostalgia e redescubra as obras-primas
              que marcaram gerações.
            </p>
          </div>

          <div className="welcome-actions">
            <button
              type="button"
              className="welcome-login-button"
              onClick={onGoToLogin}
            >
              <span className="material-symbols-outlined">login</span>
              Fazer Login
            </button>

            <button
              type="button"
              className="welcome-signup-button"
              onClick={onGoToSignup}
            >
              <span className="material-symbols-outlined">person_add</span>
              Criar Conta
            </button>
          </div>
        </section>
      </main>

      <footer className="welcome-footer">
        <div>© 2026. All rights reserved.</div>

        <nav className="welcome-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
        </nav>
      </footer>
    </div>
  );
}