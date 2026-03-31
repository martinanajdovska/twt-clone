export interface IProfileHeader {
  username: string;
  displayName: string | null;
  followers: number;
  following: number;
  isFollowed: boolean;
  isFollowingYou: boolean;
  imageUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birthday: string | null;
  createdAt: string;
}

export interface IUpdateProfileResponse {
  displayName: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birthday: string | null;
  bannerUrl: string | null;
  createdAt: string;
}

export interface ISearchBoxUser {
  id?: number;
  createdAt?: string;
  username: string;
  displayName?: string | null;
  imageUrl: string | null;
  secondaryText?: string;
  key?: string;
}
