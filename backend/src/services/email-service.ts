import nodemailer from 'nodemailer';

// 1. Criamos o "transporte".
// Aqui estamos configurando para usar o Gmail, mas pode ser outro provedor.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// 2. Criamos a função que será chamada para disparar o email
export const sendVerificationEmail = async (to: string, code: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Seu código de verificação - Plataforma de Filmes',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Bem-vindo à nossa plataforma!</h2>
                    <p>Para concluir o seu registo, por favor utilize o código de 6 dígitos abaixo:</p>
                    <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
                    <p>Se você não solicitou este registo, pode ignorar este e-mail.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-mail de verificação enviado para ${to}`);
        
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        throw new Error("Não foi possível enviar o e-mail de verificação.");
    }
};