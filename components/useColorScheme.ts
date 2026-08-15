import { useAppTheme } from "@/contexts/ThemeContext";

export const useColorScheme = () => useAppTheme().scheme;
