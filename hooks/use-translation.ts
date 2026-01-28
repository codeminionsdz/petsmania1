import { useLanguage } from "@/lib/language-context"
import { getTranslation, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key)
  }

  return { t, language }
}
