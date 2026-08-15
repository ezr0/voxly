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

export type Episode = {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  artworkUrl: string;
  releaseDate: string;
  durationMillis: number;
  podcastId: number;
  podcastTitle: string;
};
