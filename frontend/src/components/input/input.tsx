import React from 'react';
import './input.css'; // Mantenha a importação com letras minúsculas

// 1. Atualizamos a interface para aceitar a propriedade 'icon'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; 
  error?: string;
  icon?: React.ReactNode; // Adicionamos esta linha: pode receber um ícone React
}

export const Input: React.FC<InputProps> = ({ label, error, icon, ...props }) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      
      {/* 2. Criamos um container para o input e o ícone juntos */}
      <div className={`input-container ${error ? 'input-container--error' : ''}`}>
        {/* 3. Se um ícone for passado, ele aparece aqui */}
        {icon && <div className="input-icon-left">{icon}</div>}
        
        <input 
          className="input-element" 
          {...props} 
        />
      </div>
      
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};