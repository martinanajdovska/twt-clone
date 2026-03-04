import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/constants";

export const useRateNote = () => {
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
        onError: (err: Error) => {
            if (!err.message.toLowerCase().includes("already rated")) {
                alert(err.message);
            }
        },
    });
};