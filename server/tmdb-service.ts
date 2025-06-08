/**
 * TMDB (The Movie Database) Service
 * Fetches actor information and profile images
 */

interface TMDBPersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

interface TMDBSearchResponse {
  page: number;
  results: TMDBPersonSearchResult[];
  total_pages: number;
  total_results: number;
}

interface ActorProfile {
  id: number;
  name: string;
  profileImageUrl: string | null;
  popularity: number;
  knownFor: string;
}

export class TMDBService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for an actor by name
   */
  async searchActor(actorName: string): Promise<ActorProfile | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/person?api_key=${this.apiKey}&query=${encodeURIComponent(actorName)}`
      );

      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: TMDBSearchResponse = await response.json();

      if (data.results.length === 0) {
        console.log(`No results found for actor: ${actorName}`);
        return null;
      }

      // Get the most popular result that's an actor
      const actor = data.results
        .filter(person => person.known_for_department === 'Acting')
        .sort((a, b) => b.popularity - a.popularity)[0];

      if (!actor) {
        console.log(`No actors found for: ${actorName}`);
        return null;
      }

      return {
        id: actor.id,
        name: actor.name,
        profileImageUrl: actor.profile_path 
          ? `${this.imageBaseUrl}/w500${actor.profile_path}`
          : null,
        popularity: actor.popularity,
        knownFor: actor.known_for_department
      };

    } catch (error) {
      console.error('Error searching for actor:', error);
      return null;
    }
  }

  /**
   * Get multiple actor profiles
   */
  async getActorProfiles(actorNames: string[]): Promise<Record<string, ActorProfile | null>> {
    const profiles: Record<string, ActorProfile | null> = {};

    // Process actors in batches to avoid hitting rate limits
    for (const actorName of actorNames) {
      profiles[actorName] = await this.searchActor(actorName);
      
      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return profiles;
  }

  /**
   * Generate a placeholder avatar URL for actors without photos
   */
  generatePlaceholderAvatar(actorName: string): string {
    const initials = actorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=500&background=6366f1&color=ffffff&bold=true`;
  }
}

export const tmdbService = process.env.TMDB_API_KEY 
  ? new TMDBService(process.env.TMDB_API_KEY)
  : null;