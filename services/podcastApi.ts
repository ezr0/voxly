import { Podcast } from '@/types/podcast';

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

const DISCOVER_QUERY = 'technology';

function mapItunesPodcast(item: ItunesPodcast): Podcast {
  return {
    id: item.collectionId,
    title: item.collectionName,
    author: item.artistName,
    artworkUrl: item.artworkUrl600 ?? item.artworkUrl100 ?? '',
    feedUrl: item.feedUrl ?? '',
    genres: item.genres ?? [],
    description: `${item.artistName} • ${(item.genres ?? []).join(' · ')}`,
  };
}

async function fetchPodcasts(term: string) {
  const params = new URLSearchParams({
    media: 'podcast',
    entity: 'podcast',
    limit: '30',
    term,
  });

  const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Could not load podcasts');
  }

  const data = (await response.json()) as ItunesSearchResponse;
  return data.results.map(mapItunesPodcast);
}

export function fetchDiscoverPodcasts() {
  return fetchPodcasts(DISCOVER_QUERY);
}

export function searchPodcasts(term: string) {
  return fetchPodcasts(term.trim());
}
