import React, { useState } from 'react';
import axios from 'axios';

interface VerifyEmailProps {
  email: string;
  onSuccess: () => void; 
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await axios.post('http://localhost:3000/api/verify-email', {
        email: email,
        code: code
      });

      setSuccessMsg(response.data.message); 
      
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: unknown) { 
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Ocorreu um erro ao verificar o código.');
      } 
      else if (err instanceof Error) {
        setError(err.message);
      } 
      else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verificacao-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Verifique o seu E-mail</h2>
      <p>Enviámos um código de 6 dígitos para <strong style={{ color: '#FFC107' }}>{email}</strong>.</p>
      <p>Por favor, introduza-o abaixo para ativar a sua conta.</p>

      <form onSubmit={handleVerify} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <input 
          type="text" 
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ 
            fontSize: '24px', 
            letterSpacing: '5px', 
            textAlign: 'center', 
            width: '180px',
            padding: '10px',
            backgroundColor: 'transparent',
            border: '1px solid #FFC107', // Borda dourada para combinar
            color: '#ffffff',
            borderRadius: '6px'
          }}
          required
        />
        
        {/* ✨ AQUI ESTÁ A MUDANÇA: A classe btn-primary-gold foi adicionada! */}
        <button 
          type="submit" 
          className="btn-primary-gold" 
          disabled={loading || code.length < 6}
          style={{ width: '100%' }} // Faz o botão ocupar a largura correta
        >
          {loading ? 'A verificar...' : 'Ativar Conta'}
        </button>
      </form>

      {error && <p style={{ color: '#ff4d4d', marginTop: '15px', fontWeight: '500' }}>{error}</p>}
      {successMsg && <p style={{ color: '#4ade80', marginTop: '15px', fontWeight: '500' }}>{successMsg}</p>}
    </div>
  );
};

export default VerifyEmail;