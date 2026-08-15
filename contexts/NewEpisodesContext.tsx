import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useLibrary } from "@/contexts/LibraryContext";
import { fetchPodcastDetails } from "@/services/podcastApi";

const STORAGE_KEY = "voxly.lastSeenEpisodeIds";

type LastSeenMap = Record<string, number>;

async function loadLastSeen(): Promise<LastSeenMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastSeenMap) : {};
  } catch {
    return {};
  }
}

async function saveLastSeen(map: LastSeenMap) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore persistence failures; badges will just re-check next load.
  }
}

function latestEpisodeId(
  episodes: { id: number; releaseDate: string }[],
): number | null {
  if (!episodes.length) return null;
  const sorted = [...episodes].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
  );
  return sorted[0].id;
}

type NewEpisodesContextValue = {
  hasNewEpisode: (podcastId: number) => boolean;
  markPodcastSeen: (podcastId: number, latestId: number | null) => void;
};

const NewEpisodesContext = createContext<NewEpisodesContextValue | undefined>(
  undefined,
);

export function NewEpisodesProvider({ children }: { children: ReactNode }) {
  const { savedPodcasts } = useLibrary();
  const [lastSeen, setLastSeen] = useState<LastSeenMap>({});
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const loadedRef = useRef(false);
  const checkedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadLastSeen().then((map) => {
      setLastSeen(map);
      loadedRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;

    let cancelled = false;

    async function checkPodcasts() {
      for (const podcast of savedPodcasts) {
        if (checkedRef.current.has(podcast.id)) continue;
        checkedRef.current.add(podcast.id);

        try {
          const { episodes } = await fetchPodcastDetails(podcast.id);
          if (cancelled) return;

          const latestId = latestEpisodeId(episodes);
          if (latestId == null) continue;

          const seenId = lastSeen[String(podcast.id)];

          if (seenId == null) {
            // First time we've checked this podcast: establish a baseline
            // without flagging it as "new" so freshly-saved shows don't
            // immediately show a red dot.
            setLastSeen((prev) => {
              const next = { ...prev, [String(podcast.id)]: latestId };
              saveLastSeen(next);
              return next;
            });
          } else if (seenId !== latestId) {
            setNewIds((prev) => new Set(prev).add(podcast.id));
          }
        } catch {
          // Ignore network errors for a single podcast's badge check.
        }
      }
    }

    checkPodcasts();
    return () => {
      cancelled = true;
    };
  }, [savedPodcasts, lastSeen]);

  const hasNewEpisode = useCallback(
    (podcastId: number) => newIds.has(podcastId),
    [newIds],
  );

  const markPodcastSeen = useCallback(
    (podcastId: number, latestId: number | null) => {
      if (latestId == null) return;

      setNewIds((prev) => {
        if (!prev.has(podcastId)) return prev;
        const next = new Set(prev);
        next.delete(podcastId);
        return next;
      });

      setLastSeen((prev) => {
        const next = { ...prev, [String(podcastId)]: latestId };
        saveLastSeen(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ hasNewEpisode, markPodcastSeen }),
    [hasNewEpisode, markPodcastSeen],
  );

  return (
    <NewEpisodesContext.Provider value={value}>
      {children}
    </NewEpisodesContext.Provider>
  );
}

export function useNewEpisodes() {
  const context = useContext(NewEpisodesContext);

  if (!context) {
    throw new Error("useNewEpisodes must be used inside NewEpisodesProvider");
  }

  return context;
}
