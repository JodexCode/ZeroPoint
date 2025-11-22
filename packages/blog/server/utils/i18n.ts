// server/utils/i18n.ts
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

type Locale = 'zh-CN' | 'en-US'
type MessageKeys = 'title' | 'dbOk' | 'dbFail' | 'redisOk' | 'redisFail' | 'unknownError'

const DEFAULT_LOCALE: Locale = 'zh-CN'
const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US']

const localeCache: Record<string, any> = {}

async function loadLocaleMessages(locale: Locale) {
  if (localeCache[locale]) {
    return localeCache[locale]
  }

  try {
    const filePath = join(process.cwd(), 'server', 'locales', `${locale}.json`)
    const content = await readFile(filePath, 'utf-8')
    const messages = JSON.parse(content)
    localeCache[locale] = messages
    return messages
  } catch (err) {
    console.warn(`Failed to load locale ${locale}, falling back to ${DEFAULT_LOCALE}`)
    if (locale !== DEFAULT_LOCALE) {
      return loadLocaleMessages(DEFAULT_LOCALE)
    }
    throw err
  }
}

function detectLocale(acceptLanguageHeader?: string): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE

  // 简单解析 Accept-Language（只取第一个）
  const lang = acceptLanguageHeader.split(',')[0].trim().toLowerCase()

  // 映射常见格式：zh => zh-CN, en => en-US
  if (lang.startsWith('zh')) return 'zh-CN'
  if (lang.startsWith('en')) return 'en-US'

  // 精确匹配（如传入的是 zh-cn 而不是 zh-CN）
  const normalizedLang = lang.replace(/_/g, '-').replace(/-/g, '-')
  if (SUPPORTED_LOCALES.map(l => l.toLowerCase()).includes(normalizedLang)) {
    return SUPPORTED_LOCALES.find(l => l.toLowerCase() === normalizedLang) as Locale
  }

  return DEFAULT_LOCALE
}

export function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || `{{${key}}}`)
}

export async function getI18n(event: any) {
  const acceptLanguage = event.node.req.headers['accept-language']
  const locale = detectLocale(acceptLanguage)
  const messages = await loadLocaleMessages(locale)

  return {
    locale,
    t(key: MessageKeys, params: Record<string, string> = {}): string {
      const template = messages.healthCheck?.[key] || key
      return interpolate(template, params)
    },
  }
}
