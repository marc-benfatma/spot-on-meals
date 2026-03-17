import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'editor';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

/**
 * Fetch all user roles ordered by creation date (newest first).
 */
export async function fetchAllUserRoles(): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update a user's role.
 */
export async function updateUserRole(userId: string, newRole: AppRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Remove a user role entry by its record ID.
 */
export async function deleteUserRole(roleId: string): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
}

/**
 * Fetch a single user's role by user ID.
 */
export async function fetchUserRoleByUserId(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.role as AppRole;
}
