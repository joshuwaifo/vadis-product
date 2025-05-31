import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, UserRole } from "@shared/schema";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile data when supabaseUser changes
  useEffect(() => {
    if (supabaseUser) {
      // TODO: Fetch user profile from database
      // For now, create a basic user object
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || null,
        firstName: supabaseUser.user_metadata?.first_name || null,
        lastName: supabaseUser.user_metadata?.last_name || null,
        profileImageUrl: supabaseUser.user_metadata?.avatar_url || null,
        role: null, // Will be set during role selection
        roleAssignedAt: null,
        businessEmail: null,
        businessEmailVerified: false,
        isIndividualFinancier: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      setUser(null);
    }
  }, [supabaseUser]);

  const needsBusinessEmail = user?.role && 
    ['production', 'brand', 'financier'].includes(user.role) && 
    !user.businessEmail && 
    !user.isIndividualFinancier;

  return {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated: !!supabaseUser,
    hasRole: !!user?.role,
    needsBusinessEmail,
    role: user?.role as UserRole | null,
  };
}