import api from './api';

// 1. Criamos a tipagem exata dos dados que o seu formulário vai enviar
export interface RegisterData {
    name: string;
    email: string;
    password?: string; // Coloquei o '?' caso a senha seja opcional, remova o '?' se for obrigatória
}

// 2. Trocamos o (userData: any) por (userData: RegisterData)
export const registerUser = async (userData: RegisterData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao comunicar com a API:", error);
        throw error;
    }
};