import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUserRoles, updateUserRole, deleteUserRole, AppRole, UserRole } from '@/services/user-role.service';
import { useToast } from '@/hooks/use-toast';

const USER_ROLES_QUERY_KEY = ['user-roles'] as const;

export type { AppRole, UserRole } from '@/services/user-role.service';

export function useUserRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: USER_ROLES_QUERY_KEY,
    queryFn: fetchAllUserRoles,
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      updateUserRole(userId, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: USER_ROLES_QUERY_KEY });
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${role}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => deleteUserRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ROLES_QUERY_KEY });
      toast({
        title: 'User removed',
        description: 'User has been removed from the system.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user',
        variant: 'destructive',
      });
    },
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    changeRole: (userId: string, role: AppRole) => updateMutation.mutate({ userId, role }),
    removeUser: (roleId: string) => deleteMutation.mutateAsync(roleId),
    isUpdating: updateMutation.isPending,
    updatingUserId: updateMutation.isPending ? updateMutation.variables?.userId : null,
  };
}
