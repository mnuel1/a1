import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, addUser, updateUserInfo, updateUserStatus } from "../api/users";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    ...query,
    addUser: addMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    updateUserStatus: updateStatusMutation.mutateAsync,
  };
};