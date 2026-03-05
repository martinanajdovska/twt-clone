import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/constants";

export const useRateNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, helpful }: { noteId: number, helpful: boolean }) => {
            const res = await fetch(`${BASE_URL}/api/community-notes/${noteId}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ helpful }),
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community-notes"] });
            queryClient.invalidateQueries({ queryKey: ["tweet"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
        onError: (err: Error) => {
            if (!err.message.toLowerCase().includes("already rated")) {
                alert(err.message);
            }
        },
    });
};