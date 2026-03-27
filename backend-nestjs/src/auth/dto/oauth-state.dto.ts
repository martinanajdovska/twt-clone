export interface OAuthStateDto {
  nonce: string;
  platform: 'native' | 'web';
  createdAt: number;
  returnTo?: string;
}
