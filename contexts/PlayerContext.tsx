import {
    AudioPlayer,
    createAudioPlayer,
    setAudioModeAsync,
    useAudioPlayerStatus,
} from "expo-audio";
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

import { Episode } from "@/types/podcast";

export type SleepTimerOption = "off" | "endOfEpisode" | number;

type PlayerContextValue = {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playEpisode: (episode: Episode) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => Promise<void>;
  closePlayer: () => void;
  sleepTimerOption: SleepTimerOption;
  sleepTimerRemainingSeconds: number | null;
  setSleepTimer: (option: SleepTimerOption) => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = createAudioPlayer();
  }
  const player = playerRef.current;
  const status = useAudioPlayerStatus(player);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const [sleepTimerOption, setSleepTimerOption] =
    useState<SleepTimerOption>("off");
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState<number | null>(null);
  const [sleepTimerRemainingSeconds, setSleepTimerRemainingSeconds] = useState<
    number | null
  >(null);
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSleepTimers = useCallback(() => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
  }, []);

  const setSleepTimer = useCallback(
    (option: SleepTimerOption) => {
      clearSleepTimers();
      setSleepTimerOption(option);

      if (typeof option === "number") {
        const endsAt = Date.now() + option * 60_000;
        setSleepTimerEndsAt(endsAt);
        setSleepTimerRemainingSeconds(option * 60);

        sleepIntervalRef.current = setInterval(() => {
          setSleepTimerRemainingSeconds(
            Math.max(0, Math.round((endsAt - Date.now()) / 1000)),
          );
        }, 1000);

        sleepTimeoutRef.current = setTimeout(() => {
          playerRef.current?.pause();
          clearSleepTimers();
          setSleepTimerOption("off");
          setSleepTimerEndsAt(null);
          setSleepTimerRemainingSeconds(null);
        }, option * 60_000);
      } else {
        setSleepTimerEndsAt(null);
        setSleepTimerRemainingSeconds(null);
      }
    },
    [clearSleepTimers],
  );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });

    return () => {
      clearSleepTimers();
      playerRef.current?.remove();
    };
  }, [clearSleepTimers]);

  useEffect(() => {
    if (sleepTimerOption === "endOfEpisode" && status.didJustFinish) {
      playerRef.current?.pause();
      setSleepTimerOption("off");
    }
  }, [sleepTimerOption, status.didJustFinish]);

  const playEpisode = useCallback(
    (episode: Episode) => {
      setCurrentEpisode(episode);
      player.replace(episode.audioUrl);
      player.play();
    },
    [player],
  );

  const togglePlayPause = useCallback(() => {
    if (!currentEpisode) return;

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [currentEpisode, player]);

  const seekTo = useCallback(
    async (seconds: number) => {
      await player.seekTo(seconds);
    },
    [player],
  );

  const closePlayer = useCallback(() => {
    player.pause();
    setCurrentEpisode(null);
    clearSleepTimers();
    setSleepTimerOption("off");
    setSleepTimerEndsAt(null);
    setSleepTimerRemainingSeconds(null);
  }, [clearSleepTimers, player]);

  const value = useMemo(
    () => ({
      currentEpisode,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      currentTime: status.currentTime,
      duration: status.duration,
      playEpisode,
      togglePlayPause,
      seekTo,
      closePlayer,
      sleepTimerOption,
      sleepTimerRemainingSeconds,
      setSleepTimer,
    }),
    [
      closePlayer,
      currentEpisode,
      playEpisode,
      seekTo,
      sleepTimerOption,
      sleepTimerRemainingSeconds,
      setSleepTimer,
      status,
      togglePlayPause,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }

  return context;
}
