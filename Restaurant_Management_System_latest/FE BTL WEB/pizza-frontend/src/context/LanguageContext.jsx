import { createContext, useContext, useEffect, useMemo, useState } from "react"

const LANGUAGE_STORAGE_KEY = "hs_language"
const DEFAULT_LANGUAGE = "vn"

const LanguageContext = createContext(null)

function normalizeLanguage(value) {
  return String(value || "").trim().toLowerCase() === "en" ? "en" : DEFAULT_LANGUAGE
}

function loadStoredLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE

  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(loadStoredLanguage)

  useEffect(() => {
    const nextLanguage = normalizeLanguage(language)

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLanguage === "en" ? "en" : "vi"
    }
  }, [language])

  const value = useMemo(() => ({
    language,
    isEnglish: language === "en",
    setLanguage: nextLanguage => setLanguage(normalizeLanguage(nextLanguage)),
    toggleLanguage: () => setLanguage(current => (current === "en" ? "vn" : "en")),
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      isEnglish: false,
      setLanguage: () => {},
      toggleLanguage: () => {},
    }
  }

  return context
}

