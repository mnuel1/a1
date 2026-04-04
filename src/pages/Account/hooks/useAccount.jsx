import { useMutation } from "@tanstack/react-query";
import { updateLoginID, updatePassword } from "../api/account";
import { useLoading } from "../../../context/useLoading";

export const useAccount = () => {
  const { setLoading } = useLoading();

  const loginMutation = useMutation({
    mutationFn: ({ loginID, id }) => updateLoginID(loginID, id),
    onMutate:   () => setLoading(true),
    onSettled:  () => setLoading(false),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ password, confirmPassword, id }) =>
      updatePassword(password, confirmPassword, id),
    onMutate:   () => setLoading(true),
    onSettled:  () => setLoading(false),
  });

  return {
    updateLogin:        loginMutation.mutateAsync,
    updatePassword:     passwordMutation.mutateAsync,
    isUpdatingLogin:    loginMutation.isPending,
    isUpdatingPassword: passwordMutation.isPending,
  };
};