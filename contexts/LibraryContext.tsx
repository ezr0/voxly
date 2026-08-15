import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
} from "firebase/firestore";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { Podcast } from "@/types/podcast";

type LibraryContextValue = {
  savedPodcasts: Podcast[];
  savedIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  savePodcast: (podcast: Podcast) => Promise<void>;
  unsavePodcast: (podcastId: number) => Promise<void>;
  toggleSaved: (podcast: Podcast) => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined,
);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedPodcasts, setSavedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user) {
      setSavedPodcasts([]);
      setIsLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "library");
    const unsubscribe = onSnapshot(
      query(ref, orderBy("savedAt", "desc")),
      (snapshot) => {
        setSavedPodcasts(snapshot.docs.map((item) => item.data() as Podcast));
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to sync library", err);
        setError("Could not sync your library right now.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const savedIds = useMemo(
    () => new Set(savedPodcasts.map((podcast) => podcast.id)),
    [savedPodcasts],
  );

  const savePodcast = useCallback(
    async (podcast: Podcast) => {
      if (!db || !user) {
        setError("Sign-in is required to save podcasts.");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "library", String(podcast.id));
        await setDoc(ref, {
          ...podcast,
          savedAt: Date.now(),
        });
        setError(null);
      } catch (err) {
        console.error("Failed to save podcast", err);
        setError("Could not save this podcast. Please try again.");
      }
    },
    [user],
  );

  const unsavePodcast = useCallback(
    async (podcastId: number) => {
      if (!db || !user) {
        setError("Sign-in is required to update your library.");
        return;
      }

      try {
        await deleteDoc(
          doc(db, "users", user.uid, "library", String(podcastId)),
        );
        setError(null);
      } catch (err) {
        console.error("Failed to remove podcast", err);
        setError("Could not remove this podcast. Please try again.");
      }
    },
    [user],
  );

  const toggleSaved = useCallback(
    async (podcast: Podcast) => {
      if (savedIds.has(podcast.id)) {
        await unsavePodcast(podcast.id);
        return;
      }

      await savePodcast(podcast);
    },
    [savePodcast, savedIds, unsavePodcast],
  );

  const value = useMemo(
    () => ({
      savedPodcasts,
      savedIds,
      isLoading,
      error,
      savePodcast,
      unsavePodcast,
      toggleSaved,
    }),
    [
      error,
      isLoading,
      savePodcast,
      savedIds,
      savedPodcasts,
      toggleSaved,
      unsavePodcast,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error("useLibrary must be used inside LibraryProvider");
  }

  return context;
}
