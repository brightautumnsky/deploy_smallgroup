export interface User {
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  type: string;
  payload: any;
}

export interface Group {
  createdAt: string;
  updatedAt: string;
  name: string;
  interests: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  posts: Post[];
  postCount?: string;
  imageUrl: string;
  bannerUrl: string;
}

export interface Post {
  identifier: string;
  title: string;
  slug: string;
  body: string;
  groupName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  group?: Group;
  url: string;
  userLike?: number;
  likeScore?: number;
  commentCount?: number;
}

export interface Comment {
  identifier: string;
  body: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  post?: Post;
  userLike: number;
  likeScore: number;
}
