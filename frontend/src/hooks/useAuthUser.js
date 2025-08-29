import { getUser } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getUser,
    retry: false,
  });
  
  return {
    authUser: authUser.data?.user || null,
    isLoading: authUser.isLoading,
    error: authUser.error,
  };
}

export default useAuthUser