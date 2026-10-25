import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Language } from "../game/types";
import { translate } from "./messages";

const LanguageContext = createContext<Language>("en");
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useI18n() {
  const language = useContext(LanguageContext);
  return useMemo(
    () => ({
      language,
      t: (
        key: string | null | undefined,
        params?: Record<string, string | number>,
        fallback?: string,
      ) => translate(language, key ?? "", params, fallback),
    }),
    [language],
  );
}
