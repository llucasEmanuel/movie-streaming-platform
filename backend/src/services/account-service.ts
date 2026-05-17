import { AccountRepository } from '../repositories/account-repository';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/errors';

export class AccountService {
   private repo: AccountRepository;

   constructor() {
      this.repo = new AccountRepository();
   }

   async getProfile(id: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      return {
         name: user.name,
         email: user.email,
         photo: user.avatarUrl
      };
   }

   async updateProfile(id: string, data: { name?: string, email?: string, password?: string, photo?: { filename: string, sizeMB: number } }) {
      let user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      let isChanged = false;
      const updates: any = {};

      if (data.name && data.name !== user.name) {
         this.validateName(data.name);
         updates.name = data.name;
         isChanged = true;
      }
      if (data.email && data.email !== user.email) {
         await this.validateEmail(data.email, id);
         updates.email = data.email;
         isChanged = true;
      }
      if (data.password && data.password !== user.password) {
         this.validatePassword(data.password, user.password);
         updates.password = data.password;
         isChanged = true;
      }
      if (data.photo) {
         this.validatePhoto(data.photo.filename, data.photo.sizeMB);
         updates.photo = data.photo.filename;
         isChanged = true;
      }

      if (!isChanged) {
         throw new BadRequestError("Nenhuma alteração foi realizada"); 
      }

      return await this.repo.update(id, updates);
   }

   private async validateEmail(newEmail: string, userId: string) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(newEmail)) throw new BadRequestError("Falha ao salvar alterações. E-mail inválido");

      const exists = await this.repo.findByEmail(newEmail);
      if (exists && exists.id !== userId) throw new ConflictError("E-mail já em uso");
   }

   async updateEmail(id: string, newEmail: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      
      if (user.email === newEmail) {
         throw new BadRequestError("Nenhuma alteração foi realizada");
      }

      await this.validateEmail(newEmail, id);
      return await this.repo.update(id, { email: newEmail });
   }

   private validateName(newName: string) {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(newName)) throw new BadRequestError("Nome inválido");
   }

   async updateName(id: string, newName: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      if (user.name === newName) throw new BadRequestError("Nenhuma alteração foi realizada");

      this.validateName(newName);
      return await this.repo.update(id, { name: newName });
   }

   private validatePassword(newPassword: string, currentPassword?: string | null) {
      if (currentPassword === newPassword) {
         throw new BadRequestError("A nova senha deve ser diferente da atual");
      }
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passRegex.test(newPassword)) {
         throw new BadRequestError("Senha fora do padrão exigido");
      }
   }

   async updatePassword(id: string, newPassword: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      this.validatePassword(newPassword, user.password);
      return await this.repo.update(id, { password: newPassword });
   }

   private validatePhoto(filename: string, sizeMB: number) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
         throw new BadRequestError("Arquivo inválido");
      }
      if (sizeMB > 15) {
         throw new BadRequestError("Arquivo excede o tamanho permitido");
      }
   }

   async updatePhoto(id: string, filename: string, sizeMB: number) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      this.validatePhoto(filename, sizeMB);
      return await this.repo.update(id, { photo: filename });
   }
}
