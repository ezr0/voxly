import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";

type AppThemeContextValue = {
  preference: ThemePreference;
  scheme: ResolvedScheme;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = "voxly.theme.preference";

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined,
);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const scheme: ResolvedScheme = useMemo(
    () =>
      preference === "system"
        ? deviceScheme === "dark"
          ? "dark"
          : "light"
        : preference,
    [deviceScheme, preference],
  );

  const value = useMemo(
    () => ({ preference, scheme, setPreference }),
    [preference, scheme, setPreference],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
