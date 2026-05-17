import { Request, Response } from 'express';
import { AccountService } from '../services/account-service';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/errors';

const service = new AccountService();

const handleError = (err: any, res: Response) => {
   if (err instanceof BadRequestError || err instanceof NotFoundError || err instanceof ConflictError) {
      res.status((err as any).statusCode || (err instanceof NotFoundError ? 404 : err instanceof ConflictError ? 409 : 400)).json({ message: err.message });
   } else {
      res.status(500).json({ message: 'Erro interno' });
   }
};

export const getProfile = async (req: Request, res: Response) => {
   try {
      const profile = await service.getProfile(req.params.id as string);
      res.status(200).json(profile);
   } catch (err: any) {
      handleError(err, res);
   }
};

export const updateProfile = async (req: Request, res: Response) => {
   try {
      const result = await service.updateProfile(req.params.id as string, req.body);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

export const updateEmail = async (req: Request, res: Response) => {
   try {
      const result = await service.updateEmail(req.params.id as string, req.body.email);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

export const updateName = async (req: Request, res: Response) => {
   try {
      const result = await service.updateName(req.params.id as string, req.body.name);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

export const updatePassword = async (req: Request, res: Response) => {
   try {
      const result = await service.updatePassword(req.params.id as string, req.body.password);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};

export const updatePhoto = async (req: Request, res: Response) => {
   try {
      const { filename, sizeMB } = req.body;
      const result = await service.updatePhoto(req.params.id as string, filename, sizeMB);
      res.status(200).json({ message: 'Alterações salvas com sucesso', user: result });
   } catch (err: any) {
      handleError(err, res);
   }
};
