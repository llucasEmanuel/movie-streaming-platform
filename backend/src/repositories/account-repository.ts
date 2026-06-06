import { prisma } from '../database/prisma';

/**
 * Classe de repositório responsável pelas operações de persistência
 * e manipulação dos dados de conta (usuários) no banco de dados utilizando o Prisma.
 */
export class AccountRepository {
   
   /**
    * Busca um usuário no banco de dados através do seu ID único.
    * @param id Identificador único do usuário (UUID ou String).
    * @returns Retorna o objeto do usuário encontrado ou null caso não exista.
    */
   async findById(id: string) {
      // O método findUnique busca por campos que possuem a restrição @id ou @unique no schema do Prisma
      return await prisma.user.findUnique({ 
         where: { id } 
      });
   }

   /**
    * Busca um usuário no banco de dados através do endereço de e-mail.
    * @param email Endereço de e-mail do usuário.
    * @returns Retorna o objeto do usuário encontrado ou null caso não exista.
    */
   async findByEmail(email: string) {
      // Busca baseada no campo de e-mail, que deve ser único no banco de dados
      return await prisma.user.findUnique({ 
         where: { email } 
      });
   }

   /**
    * Atualiza as informações de cadastro e perfil de um usuário específico.
    * @param id Identificador único do usuário que será atualizado.
    * @param data Objeto contendo os novos dados que serão salvos.
    * @returns Retorna o objeto do usuário com os dados já atualizados.
    */
   async update(id: string, data: any) {
      return await prisma.user.update({
         // Condição para encontrar o registro exato que será modificado
         where: { id },
         
         // Mapeamento dos dados recebidos para as respectivas colunas do modelo no banco de dados
         data: {
            name: data.name,
            email: data.email,
            password: data.password,
            avatarUrl: data.photo // Mapeia o campo 'photo' vindo do DTO/serviço para a coluna 'avatarUrl' do banco
         }
      });
   }
}

