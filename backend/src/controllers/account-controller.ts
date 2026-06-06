import { Request, Response } from 'express';
import { AccountService } from '../services/account-service';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/errors';

// Instancia o serviço que lida com as regras de negócio e persistência de dados de conta
const service = new AccountService();

/**
 * Função utilitária centralizada para tratamento de exceções (erros).
 * Ela identifica o tipo de erro lançado pela camada de serviço e responde
 * ao cliente com o status HTTP correto e a mensagem adequada.
 */
const handleError = (err: any, res: Response) => {
   // Verifica se o erro é uma das exceções de negócio conhecidas da aplicação
   if (err instanceof BadRequestError || err instanceof NotFoundError || err instanceof ConflictError) {
      
      // Define o status HTTP dinamicamente com base na classe do erro.
      // Se não houver um statusCode embutido, mapeia: NotFound -> 404, Conflict -> 409, outros -> 400.
      const status = (err as any).statusCode || (
         err instanceof NotFoundError ? 404 : 
         err instanceof ConflictError ? 409 : 400
      );
      
      // Retorna a resposta ao cliente com o status mapeado e a mensagem do erro
      res.status(status).json({ message: err.message });
   } else {
      // Caso seja um erro desconhecido ou falha no servidor (ex: banco de dados offline), retorna 500
      res.status(500).json({ message: 'Erro interno' });
   }
};

/**
 * Busca e retorna o perfil de um usuário com base no ID fornecido na URL.
 */
export const getProfile = async (req: Request, res: Response) => {
   try {
      // Extrai o ID dos parâmetros da rota e chama o serviço
      const profile = await service.getProfile(req.params.id as string);
      
      // Retorna 200 OK com os dados do perfil encontrado
      res.status(200).json(profile);
   } catch (err: any) {
      // Encaminha qualquer erro interceptado para o manipulador de erros
      handleError(err, res);
   }
};

/**
 * Atualiza o perfil completo do usuário utilizando todos os dados enviados no corpo da requisição.
 */
export const updateProfile = async (req: Request, res: Response) => {
   try {
      // Passa o ID da URL e o objeto req.body completo para o método de atualização
      const result = await service.updateProfile(req.params.id as string, req.body);
      
      // Retorna sucesso com mensagem de confirmação e os dados atualizados do usuário
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

/**
 * Atualiza especificamente o endereço de e-mail do usuário.
 */
export const updateEmail = async (req: Request, res: Response) => {
   try {
      // Extrai o e-mail do corpo da requisição e envia para o serviço
      const result = await service.updateEmail(req.params.id as string, req.body.email);
      
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

/**
 * Atualiza especificamente o nome do usuário.
 */
export const updateName = async (req: Request, res: Response) => {
   try {
      // Extrai o nome do corpo da requisição e envia para o serviço
      const result = await service.updateName(req.params.id as string, req.body.name);
      
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

/**
 * Atualiza a senha do usuário no sistema.
 */
export const isValidPasswordPattern = (password: string): boolean => {
   if (!password || password.length < 6) return false;
   
   const hasUpperCase = /[A-Z]/.test(password);
   const hasSpecialChar = /[@#$!%*?&]/.test(password);
   
   return hasUpperCase && hasSpecialChar;
};

export const updatePassword = async (req: Request, res: Response) => {
   try {
      const { password } = req.body;

      // Aplicação da condicional decomposta e extraída
      if (!isValidPasswordPattern(password)) {
         return res.status(400).json({ message: 'Senha fora do padrão exigido' });
      }

      const result = await service.updatePassword(req.params.id as string, password);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

/**
 * Atualiza as informações da foto de perfil do usuário.
 */
export const updatePhoto = async (req: Request, res: Response) => {
   try {
      // Desestrutura os dados da foto (nome do arquivo e tamanho em MB) enviados no body
      const { filename, sizeMB } = req.body;
      
      // Envia os metadados da foto para o processamento da camada de serviço
      const result = await service.updatePhoto(req.params.id as string, filename, sizeMB);
      
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

