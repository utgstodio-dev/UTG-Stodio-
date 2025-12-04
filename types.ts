export enum ContentType {
  VIDEO = 'VIDEO',
  SHORT = 'SHORT',
  POST = 'POST'
}

export interface User {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  followers: number;
  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
}

export interface Content {
  id: string;
  type: ContentType;
  url: string; // Video URL or Image URL
  thumbnail?: string;
  title?: string;
  description: string;
  user: User;
  likes: number;
  dislikes: number;
  comments: Comment[];
  views?: number;
}

export type Tab = 'HOME' | 'SHORTS' | 'UPLOAD' | 'DASHBOARD' | 'PROFILE';
