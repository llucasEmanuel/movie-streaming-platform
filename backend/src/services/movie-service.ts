import { MovieRepository } from "../repositories/movie-repository";

export class MovieService {
    private repository = new MovieRepository();

    async getMetadata(id: string) {
    const movie = await this.repository.findById(id); // <--- Chama o repositório

    if (!movie) throw new Error("Filme não encontrado");
    // 3. Aplicação dos seus cenários de Gherkin (Fallback de Título e N/A)
    return {
      id: movie.id,
      title: movie.title || "No title", // Scenario: Ausência de título
      synopsis: movie.synopsis || "N/A",      // Scenario: Ausência de metadados
      genres: movie.genres || "N/A",
      duration: movie.duration || "N/A",
      director: movie.director || "N/A",
      cast: movie.cast || "N/A"
    };
  }
}