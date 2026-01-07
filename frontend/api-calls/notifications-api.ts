import {BASE_URL} from "@/lib/constants";

export const getNotifications = async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
        credentials: 'include'
    });
    return res.json();
}