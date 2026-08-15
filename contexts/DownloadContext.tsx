import { Directory, File, Paths } from "expo-file-system";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

import { Episode } from "@/types/podcast";

export type DownloadStatus = "idle" | "downloading" | "downloaded" | "error";

export type DownloadState = {
  status: DownloadStatus;
  progress: number;
  localUri: string | null;
};

const IDLE_STATE: DownloadState = {
  status: "idle",
  progress: 0,
  localUri: null,
};

function episodesDirectory(): Directory {
  return new Directory(Paths.document, "episodes");
}

function guessExtension(url: string): string {
  const match = url.match(/\.(mp3|m4a|aac|wav|ogg)(?:\?|$)/i);
  return match ? `.${match[1].toLowerCase()}` : ".mp3";
}

function localFileFor(episode: Episode): File {
  return new File(
    episodesDirectory(),
    `${episode.id}${guessExtension(episode.audioUrl)}`,
  );
}

type DownloadContextValue = {
  getDownloadState: (episode: Episode) => DownloadState;
  downloadEpisode: (episode: Episode) => Promise<void>;
  deleteDownload: (episode: Episode) => void;
  getPlaybackUri: (episode: Episode) => string;
};

const DownloadContext = createContext<DownloadContextValue | undefined>(
  undefined,
);

export function DownloadProvider({ children }: { children: ReactNode }) {
  const [downloads, setDownloads] = useState<Record<number, DownloadState>>({});
  const checkedRef = useRef<Set<number>>(new Set());

  const setState = useCallback((episodeId: number, state: DownloadState) => {
    setDownloads((prev) => ({ ...prev, [episodeId]: state }));
  }, []);

  const getDownloadState = useCallback(
    (episode: Episode): DownloadState => {
      const existing = downloads[episode.id];
      if (existing) return existing;

      if (!checkedRef.current.has(episode.id)) {
        checkedRef.current.add(episode.id);
        try {
          const file = localFileFor(episode);
          if (file.exists) {
            const state: DownloadState = {
              status: "downloaded",
              progress: 1,
              localUri: file.uri,
            };
            // Defer state update to avoid setting state during render.
            setTimeout(() => setState(episode.id, state), 0);
            return state;
          }
        } catch {
          // Ignore filesystem errors; treat as not downloaded.
        }
      }

      return IDLE_STATE;
    },
    [downloads, setState],
  );

  const downloadEpisode = useCallback(
    async (episode: Episode) => {
      setState(episode.id, {
        status: "downloading",
        progress: 0,
        localUri: null,
      });

      try {
        const directory = episodesDirectory();
        if (!directory.exists) {
          directory.create({ intermediates: true });
        }

        const destination = localFileFor(episode);
        const task = File.createDownloadTask(episode.audioUrl, destination, {
          onProgress: ({ bytesWritten, totalBytes }) => {
            const progress =
              totalBytes > 0 ? Math.min(bytesWritten / totalBytes, 1) : 0;
            setState(episode.id, {
              status: "downloading",
              progress,
              localUri: null,
            });
          },
        });

        const file = await task.downloadAsync();
        if (!file) throw new Error("Download did not complete");

        setState(episode.id, {
          status: "downloaded",
          progress: 1,
          localUri: file.uri,
        });
      } catch (err) {
        console.error("Failed to download episode", err);
        setState(episode.id, { status: "error", progress: 0, localUri: null });
      }
    },
    [setState],
  );

  const deleteDownload = useCallback(
    (episode: Episode) => {
      try {
        const file = localFileFor(episode);
        if (file.exists) {
          file.delete();
        }
      } catch (err) {
        console.error("Failed to delete downloaded episode", err);
      } finally {
        setState(episode.id, IDLE_STATE);
      }
    },
    [setState],
  );

  const getPlaybackUri = useCallback(
    (episode: Episode) => {
      const state = getDownloadState(episode);
      return state.status === "downloaded" && state.localUri
        ? state.localUri
        : episode.audioUrl;
    },
    [getDownloadState],
  );

  const value = useMemo(
    () => ({
      getDownloadState,
      downloadEpisode,
      deleteDownload,
      getPlaybackUri,
    }),
    [getDownloadState, downloadEpisode, deleteDownload, getPlaybackUri],
  );

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  const context = useContext(DownloadContext);

  if (!context) {
    throw new Error("useDownloads must be used inside DownloadProvider");
  }

  return context;
}
