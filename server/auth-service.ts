import { storage } from "./storage";
import type { ProductionUser, BrandUser, FinancierUser, CreatorUser } from "@shared/schema";

export type AuthenticatedUser = 
  | { role: 'production'; user: ProductionUser }
  | { role: 'brand'; user: BrandUser }
  | { role: 'financier'; user: FinancierUser }
  | { role: 'creator'; user: CreatorUser };

export class AuthService {
  /**
   * Unified login that checks all user role tables
   */
  async login(email: string, password: string): Promise<AuthenticatedUser | null> {
    // Try production user authentication
    const productionUser = await storage.validateProductionUser(email, password);
    if (productionUser) {
      return { role: 'production', user: productionUser };
    }

    // Try brand user authentication
    const brandUser = await storage.validateBrandUser(email, password);
    if (brandUser) {
      return { role: 'brand', user: brandUser };
    }

    // Try financier user authentication
    const financierUser = await storage.validateFinancierUser(email, password);
    if (financierUser) {
      return { role: 'financier', user: financierUser };
    }

    // Try creator user authentication
    const creatorUser = await storage.validateCreatorUser(email, password);
    if (creatorUser) {
      return { role: 'creator', user: creatorUser };
    }

    // No matching user found
    return null;
  }

  /**
   * Get user by email across all role tables
   */
  async getUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    // Check production users
    const productionUser = await storage.getProductionUserByEmail(email);
    if (productionUser) {
      return { role: 'production', user: productionUser };
    }

    // Check brand users
    const brandUser = await storage.getBrandUserByEmail(email);
    if (brandUser) {
      return { role: 'brand', user: brandUser };
    }

    // Check financier users
    const financierUser = await storage.getFinancierUserByEmail(email);
    if (financierUser) {
      return { role: 'financier', user: financierUser };
    }

    // Check creator users
    const creatorUser = await storage.getCreatorUserByEmail(email);
    if (creatorUser) {
      return { role: 'creator', user: creatorUser };
    }

    return null;
  }

  /**
   * Get dashboard redirect path based on user role
   */
  getDashboardPath(role: string): string {
    switch (role) {
      case 'production':
        return '/production/dashboard';
      case 'brand':
        return '/brand/dashboard';
      case 'financier':
        return '/investor/dashboard';
      case 'creator':
        return '/creator/dashboard';
      default:
        return '/dashboard';
    }
  }
}

export const authService = new AuthService();