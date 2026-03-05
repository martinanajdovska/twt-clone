export interface IProfileHeader {
  username: string;
  displayName: string | null;
  followers: number;
  following: number;
  followed: boolean;
  followsYou: boolean;
  imageUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birthday: string | null;
  createdAt: string;
}
