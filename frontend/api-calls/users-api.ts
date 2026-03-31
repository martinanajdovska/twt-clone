import { IUpdateProfileResponse } from "@/DTO/IUpdateProfileResponse";
import { BASE_URL } from "@/lib/constants";

// get profile feed for username
export const fetchProfileFeed = async ({
  pageParam = 0,
  username = "",
  tab = "tweets",
}: {
  pageParam: number;
  username: string;
  tab: string;
}) => {
  const response = await fetch(
    `${BASE_URL}/api/users/${username}?page=${pageParam}&tab=${tab}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Error getting user data");
  }

  const data = await response.json();
  return data.tweets;
};

// get username and profile picture of logged in user
export const fetchSelfUsernameAndProfilePicture = async ({
  token,
}: {
  token?: string;
}) => {
  const isServer = typeof window === "undefined";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isServer && token) {
    headers.Cookie = `token=${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/users/me/info`, {
    method: "GET",
    headers,
    ...(isServer ? {} : { credentials: "include" as const }),
  });
  if (!response.ok) {
    throw new Error("Error getting user data");
  }

  const data = await response.json();
  return data;
};

// get profile header
export const fetchProfileHeader = async ({
  username,
}: {
  username: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/users/${username}/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error getting user data");
  }

  const data = await response.json();
  return data;
};

export const updateProfile = async (
  formData: FormData,
): Promise<IUpdateProfileResponse> => {
  const res = await fetch(`${BASE_URL}/api/users/me/profile`, {
    method: "PATCH",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

// get users by username
export const fetchUsers = async (searchTerm: string) => {
  if (!searchTerm) return [];

  const res = await fetch(`${BASE_URL}/api/users?search=${searchTerm}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

export const updateProfileImage = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/api/users/me/image`, {
    method: "PATCH",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};


export const toggleFollow = async (username: string, isFollowed: boolean) => {
  const res = await fetch(`${BASE_URL}/api/users/follows/${username}`, {
    method: `${isFollowed ? "DELETE" : "POST"}`,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  return res;
}