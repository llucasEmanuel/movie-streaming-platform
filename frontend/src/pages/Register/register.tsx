import React, { useState } from 'react';
import { Input } from '../../components/input/input'; 
import { LuUser, LuAtSign, LuLock, LuShieldCheck, LuArrowRight } from 'react-icons/lu';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'; 
import './register.css'; 
import VerifyEmail from './verifyEmail';

const GoogleLoginButton = ({ onGoogleSuccess }: { onGoogleSuccess: (token: string) => void }) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onGoogleSuccess(tokenResponse.access_token),
    onError: () => console.error('Login com o Google falhou')
  });

  return (
    <button 
      type="button" 
      className="btn-google" 
      onClick={() => login()}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: 'transparent', 
        border: '1px solid #333333',
        color: '#ffffff',
        borderRadius: '6px',
        padding: '12px 0',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = '#444444';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = '#333333';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#ffffff' }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="currentColor"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
      </svg>
      <span>Cadastre-se com o Google</span>
    </button>
  );
};

// Substituímos o "any" para o ESLint não reclamar!
export const Register = ({ 
  onGoToHome, 
  onGoToLogin,
  onLogin 
}: { 
  onGoToHome: () => void; 
  onGoToLogin: () => void;
  onLogin: (user: { id: string; name: string; email: string }) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setStatusMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'As senhas não coincidem!' });
      return;
    }

    if (formData.password.length < 8) { 
      setStatusMessage({ type: 'error', text: 'Aviso: tamanho de senha inválida. Use pelo menos 8 caracteres.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = data.message || data.error || 'Erro ao criar conta.';
        const lowerError = errorMessage.toLowerCase();
        
        if (lowerError.includes('exists') || lowerError.includes('already') || lowerError.includes('uso') || lowerError.includes('vinculada')) {
          errorMessage = 'Atenção: Esta conta já está vinculada a um utilizador.';
          setTimeout(() => onGoToLogin(), 2000);
        }

        throw new Error(errorMessage);
      }

      setStatusMessage({ type: 'success', text: 'Quase lá! Verifique o seu e-mail.' });
      setShowVerification(true); 

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão com o servidor.';
      setStatusMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleGoogleRegister = async (googleToken: string) => {
    setStatusMessage(null);
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro no login social.');

      setStatusMessage({ type: 'success', text: `Bem-vindo, ${data.user?.name || 'Usuário'}! 🎉` });
      
      // Aqui o onLogin faz sentido porque o Google já verificou a pessoa e deu um ID válido
      onLogin?.({
        id: data.user?.id || data.user?.email || '',
        name: data.user?.name || 'Utilizador', // Se vier vazio, manda 'Utilizador'
        email: data.user?.email || ''
      });

      setTimeout(() => {
        onGoToHome();
      }, 1500);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao comunicar com o servidor.';
      setStatusMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <GoogleOAuthProvider clientId="697219302454-be539ui4c4cvr1rc1d0bo3kqbvi7vpe7.apps.googleusercontent.com">
      <div className="register-page-container">
        <div className="register-card">
          
          <div className="logo-section">
            <img src="/logo.png" alt="Cinema Filmes Antigos" className="main-logo" />
          </div>

          <div className="header-section">
            <h1 className="register-title">Crie sua conta</h1>
            <p className="register-subtitle">Comece sua jornada no universo cinematográfico.</p>
          </div>

          {statusMessage && (
            <div className={`status-alert ${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          {showVerification ? (
            <VerifyEmail 
              email={formData.email} 
              onSuccess={() => {
                // ✨ AQUI ESTÁ A CORREÇÃO! Apenas mostra a mensagem e manda para o login.
                setStatusMessage({ type: 'success', text: 'Conta ativada com sucesso! Redirecionando para o login...' });
                
                setTimeout(() => {
                  onGoToLogin();
                }, 1500);
              }} 
            />
          ) : (
            <>
              <form className="register-form" onSubmit={handleSubmit}>
                <Input label="Nome Completo" placeholder="Digite seu nome" icon={<LuUser />} value={formData.name} required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="E-mail" type="email" placeholder="nome@exemplo.com" icon={<LuAtSign />} value={formData.email} required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <div className="form-row-password">
                  <Input label="Senha" type="password" placeholder="........" icon={<LuLock />} value={formData.password} required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <Input label="Confirmar Senha" type="password" placeholder="........" icon={<LuShieldCheck />} value={formData.confirmPassword} required onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary-gold">CRIAR CONTA <LuArrowRight className="btn-icon-right" /></button>
              </form>

              <div className="divider-section"><span className="divider-text">OU CONTINUE COM</span></div>

              <GoogleLoginButton onGoogleSuccess={handleGoogleRegister} />
            </>
          )}

          <div className="footer-section">Já tem uma conta? <span className="gold-link" onClick={onGoToLogin} style={{cursor: 'pointer'}}>Entre aqui</span></div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};