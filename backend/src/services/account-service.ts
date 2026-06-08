import { AccountRepository } from '../repositories/account-repository';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/errors';

/**
 * Classe de Serviço responsável por aplicar as regras de negócio da aplicação
 * referentes ao gerenciamento de contas e perfis de usuários.
 */
export class AccountService {
   private repo: AccountRepository;

   constructor() {
      // Inicializa a instância do repositório para comunicação com a persistência de dados
      this.repo = new AccountRepository();
   }

   /**
    * Obtém os dados públicos do perfil de um usuário.
    * @param id Identificador único do usuário.
    * @returns Objeto formatado com nome, e-mail e foto do usuário.
    */
   async getProfile(id: string) {
      const user = await this.repo.findById(id);
      
      // Regra de Negócio: Se o usuário não existir no banco, lança erro 404
      if (!user) throw new NotFoundError("Usuário não encontrado");
      
      // Retorna apenas os dados necessários, mapeando 'avatarUrl' do banco para o termo 'photo'
      return {
         name: user.name,
         email: user.email,
         photo: user.avatarUrl
      };
   }

   /**
    * Atualiza múltiplos campos do perfil de uma única vez (atualização parcial/mista).
    * Avalia quais campos foram alterados e executa as validações específicas para cada um deles.
    */
   async updateProfile(id: string, data: { name?: string, email?: string, password?: string, photo?: { filename: string, sizeMB: number } }) {
      let user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      let isChanged = false; // Flag para rastrear se houve de fato alguma mudança nos dados
      const updates: any = {}; // Objeto que acumulará as propriedades validadas a serem atualizadas

      // 1. Validação e checagem do Nome
      if (data.name && data.name !== user.name) {
         this.validateName(data.name);
         updates.name = data.name;
         isChanged = true;
      }
      
      // 2. Validação e checagem do E-mail (Requer consulta assíncrona ao banco)
      if (data.email && data.email !== user.email) {
         await this.validateEmail(data.email, id);
         updates.email = data.email;
         isChanged = true;
      }
      
      // 3. Validação e checagem da Senha
      if (data.password && data.password !== user.password) {
         this.validatePassword(data.password, user.password);
         updates.password = data.password;
         isChanged = true;
      }
      
      // 4. Validação e checagem da Foto de perfil
      if (data.photo) {
         this.validatePhoto(data.photo.filename, data.photo.sizeMB);
         updates.photo = data.photo.filename;
         isChanged = true;
      }

      // Regra de Negócio: Se os dados enviados forem idênticos aos atuais, impede o update desnecessário
      if (!isChanged) {
         throw new BadRequestError("Nenhuma alteração foi realizada"); 
      }

      // Envia o payload acumulado com as alterações para o repositório salvar no banco
      return await this.repo.update(id, updates);
   }

   /**
    * Método privado de validação de e-mail (Formato e Unicidade).
    */
   private async validateEmail(newEmail: string, userId: string) {
      // Regex padrão para validação de estrutura de e-mails (exemplo@dominio.com)
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(newEmail)) {
         throw new BadRequestError("Falha ao salvar alterações. E-mail inválido");
      }

      // Verifica se o e-mail já está cadastrado para outro usuário no sistema
      const exists = await this.repo.findByEmail(newEmail);
      if (exists && exists.id !== userId) {
         throw new ConflictError("E-mail já em uso");
      }
   }

   /**
    * Atualiza exclusivamente o e-mail do usuário.
    */
   async updateEmail(id: string, newEmail: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      
      if (user.email === newEmail) {
         throw new BadRequestError("Nenhuma alteração foi realizada");
      }

      await this.validateEmail(newEmail, id);
      return await this.repo.update(id, { email: newEmail });
   }

   /**
    * Método privado de validação do Nome do usuário.
    */
   private validateName(newName: string) {
      // Permite apenas letras (maiúsculas e minúsculas), caracteres acentuados e espaços. Bloqueia números e caracteres especiais.
      const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      if (!nameRegex.test(newName)) throw new BadRequestError("Nome inválido");
   }

   /**
    * Atualiza exclusivamente o nome do usuário.
    */
   async updateName(id: string, newName: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      if (user.name === newName) throw new BadRequestError("Nenhuma alteração foi realizada");

      this.validateName(newName);
      return await this.repo.update(id, { name: newName });
   }

   /**
    * Método privado de validação de força e regras da Senha.
    */
   private validatePassword(newPassword: string, currentPassword?: string | null) {
      // Garante que a nova senha não seja igual à senha atualmente cadastrada
      if (currentPassword === newPassword) {
         throw new BadRequestError("A nova senha deve ser diferente da atual");
      }
      
      // Regex de Senha Forte: Mínimo 8 caracteres, pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passRegex.test(newPassword)) {
         throw new BadRequestError("Senha fora do padrão exigido");
      }
   }

   /**
    * Atualiza exclusivamente a senha do usuário.
    */
   async updatePassword(id: string, newPassword: string) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      this.validatePassword(newPassword, user.password);
      return await this.repo.update(id, { password: newPassword });
   }

   /**
    * Método privado para validação de metadados de arquivos de imagem.
    */
   private validatePhoto(filename: string, sizeMB: number) {
      // Extrai a extensão do arquivo e converte para letras minúsculas
      const ext = filename.split('.').pop()?.toLowerCase();
      
      // Valida se a extensão do arquivo está na lista de formatos permitidos
      if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
         throw new BadRequestError("Arquivo inválido");
      }
      
      // Limita o tamanho do upload da imagem em no máximo 15 Megabytes
      if (sizeMB > 15) {
         throw new BadRequestError("Arquivo excede o tamanho permitido");
      }
   }

   /**
    * Atualiza exclusivamente a foto/avatar do usuário.
    */
   async updatePhoto(id: string, filename: string, sizeMB: number) {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundError("Usuário não encontrado");

      if (filename) {
         this.validatePhoto(filename, sizeMB);
      }
      return await this.repo.update(id, { photo: filename || null });
   }
}
