import { Episode, Podcast } from "@/types/podcast";

type ItunesPodcast = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  feedUrl?: string;
  genres?: string[];
};

type ItunesSearchResponse = {
  resultCount: number;
  results: ItunesPodcast[];
};

type ItunesEpisode = {
  wrapperType: string;
  trackId: number;
  trackName: string;
  description?: string;
  shortDescription?: string;
  episodeUrl?: string;
  artworkUrl600?: string;
  artworkUrl160?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  collectionId: number;
  collectionName: string;
};

type ItunesLookupResponse = {
  resultCount: number;
  results: (ItunesPodcast & Partial<ItunesEpisode> & { wrapperType: string })[];
};

const DISCOVER_QUERY = "technology";

function mapItunesPodcast(item: ItunesPodcast): Podcast {
  return {
    id: item.collectionId,
    title: item.collectionName,
    author: item.artistName,
    artworkUrl: item.artworkUrl600 ?? item.artworkUrl100 ?? "",
    feedUrl: item.feedUrl ?? "",
    genres: item.genres ?? [],
    description: `${item.artistName} • ${(item.genres ?? []).join(" · ")}`,
  };
}

async function fetchPodcasts(term: string) {
  const params = new URLSearchParams({
    media: "podcast",
    entity: "podcast",
    limit: "30",
    term,
  });

  const response = await fetch(
    `https://itunes.apple.com/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Could not load podcasts");
  }

  const data = (await response.json()) as ItunesSearchResponse;
  return data.results.map(mapItunesPodcast);
}

export function fetchDiscoverPodcasts() {
  return fetchPodcasts(DISCOVER_QUERY);
}

export function searchPodcasts(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return Promise.resolve([]);
  return fetchPodcasts(trimmed);
}

export async function fetchPodcastDetails(id: number) {
  const params = new URLSearchParams({
    id: String(id),
    media: "podcast",
    entity: "podcastEpisode",
    limit: "50",
  });

  const response = await fetch(
    `https://itunes.apple.com/lookup?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Could not load podcast details");
  }

  const data = (await response.json()) as ItunesLookupResponse;
  const podcastEntry = data.results.find(
    (item) => item.wrapperType === "track" || item.wrapperType === "collection",
  );
  const podcast: Podcast | null = podcastEntry
    ? mapItunesPodcast(podcastEntry as ItunesPodcast)
    : null;

  const episodes: Episode[] = data.results
    .filter((item) => item.wrapperType === "podcastEpisode" && item.episodeUrl)
    .map((item) => ({
      id: item.trackId as number,
      title: item.trackName as string,
      description: item.description ?? item.shortDescription ?? "",
      audioUrl: item.episodeUrl as string,
      artworkUrl:
        item.artworkUrl600 ?? item.artworkUrl160 ?? podcast?.artworkUrl ?? "",
      releaseDate: item.releaseDate ?? "",
      durationMillis: item.trackTimeMillis ?? 0,
      podcastId: item.collectionId as number,
      podcastTitle: item.collectionName as string,
    }));

  return { podcast, episodes };
}
