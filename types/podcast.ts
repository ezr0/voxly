export type Podcast = {
  id: number;
  title: string;
  author: string;
  artworkUrl: string;
  feedUrl: string;
  genres: string[];
  description: string;
  savedAt?: number;
};
