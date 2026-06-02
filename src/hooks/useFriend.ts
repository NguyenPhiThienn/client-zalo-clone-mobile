import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContacts,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} from "@/api/friend";
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "@/api/user";

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ["friend-requests", "pending"],
    queryFn: getPendingRequests,
  });
};

export const useSentRequests = () => {
  return useQuery({
    queryKey: ["friend-requests", "sent"],
    queryFn: getSentRequests,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });
};

export const useUnfriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useBlockedUsers = () => {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: getBlockedUsers,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.setQueryData(["chats"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.filter(c => c.recipientId !== userId);
      });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

