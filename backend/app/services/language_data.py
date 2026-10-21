"""
Canonical list of supported languages with metadata.
Used by all providers for consistent display names and TTS support flags.
"""

from dataclasses import dataclass


@dataclass
class LangMeta:
    code: str          # BCP-47 base code, e.g. "en"
    name: str          # English name
    native_name: str   # Name in the language itself
    flag: str          # Emoji flag
    tts_browser: bool  # Supported by most browser Web Speech implementations
    bcp47_tts: str     # Full BCP-47 for TTS, e.g. "en-US"


LANGUAGES: list[LangMeta] = [
    LangMeta("en",  "English",            "English",              "🇺🇸", True,  "en-US"),
    LangMeta("hi",  "Hindi",              "हिन्दी",                  "🇮🇳", True,  "hi-IN"),
    LangMeta("mr",  "Marathi",            "मराठी",                  "🇮🇳", True,  "mr-IN"),
    LangMeta("ta",  "Tamil",              "தமிழ்",                  "🇮🇳", True,  "ta-IN"),
    LangMeta("te",  "Telugu",             "తెలుగు",                  "🇮🇳", True,  "te-IN"),
    LangMeta("kn",  "Kannada",            "ಕನ್ನಡ",                  "🇮🇳", False, "kn-IN"),
    LangMeta("ml",  "Malayalam",          "മലയാളം",                 "🇮🇳", False, "ml-IN"),
    LangMeta("gu",  "Gujarati",           "ગુજરાતી",                 "🇮🇳", False, "gu-IN"),
    LangMeta("pa",  "Punjabi",            "ਪੰਜਾਬੀ",                  "🇮🇳", False, "pa-IN"),
    LangMeta("bn",  "Bengali",            "বাংলা",                   "🇧🇩", True,  "bn-IN"),
    LangMeta("ur",  "Urdu",               "اردو",                   "🇵🇰", False, "ur-PK"),
    LangMeta("es",  "Spanish",            "Español",              "🇪🇸", True,  "es-ES"),
    LangMeta("fr",  "French",             "Français",             "🇫🇷", True,  "fr-FR"),
    LangMeta("de",  "German",             "Deutsch",              "🇩🇪", True,  "de-DE"),
    LangMeta("it",  "Italian",            "Italiano",             "🇮🇹", True,  "it-IT"),
    LangMeta("pt",  "Portuguese",         "Português",            "🇵🇹", True,  "pt-PT"),
    LangMeta("ru",  "Russian",            "Русский",              "🇷🇺", True,  "ru-RU"),
    LangMeta("ja",  "Japanese",           "日本語",                  "🇯🇵", True,  "ja-JP"),
    LangMeta("ko",  "Korean",             "한국어",                  "🇰🇷", True,  "ko-KR"),
    LangMeta("zh",  "Chinese (Simplified)","中文（简体）",             "🇨🇳", True,  "zh-CN"),
    LangMeta("ar",  "Arabic",             "العربية",               "🇸🇦", True,  "ar-SA"),
    LangMeta("tr",  "Turkish",            "Türkçe",               "🇹🇷", True,  "tr-TR"),
    LangMeta("nl",  "Dutch",              "Nederlands",           "🇳🇱", True,  "nl-NL"),
    LangMeta("pl",  "Polish",             "Polski",               "🇵🇱", True,  "pl-PL"),
    LangMeta("sv",  "Swedish",            "Svenska",              "🇸🇪", True,  "sv-SE"),
    LangMeta("da",  "Danish",             "Dansk",                "🇩🇰", True,  "da-DK"),
    LangMeta("fi",  "Finnish",            "Suomi",                "🇫🇮", True,  "fi-FI"),
    LangMeta("no",  "Norwegian",          "Norsk",                "🇳🇴", True,  "nb-NO"),
    LangMeta("id",  "Indonesian",         "Bahasa Indonesia",     "🇮🇩", True,  "id-ID"),
    LangMeta("ms",  "Malay",              "Bahasa Melayu",        "🇲🇾", True,  "ms-MY"),
    LangMeta("th",  "Thai",               "ภาษาไทย",               "🇹🇭", True,  "th-TH"),
    LangMeta("vi",  "Vietnamese",         "Tiếng Việt",           "🇻🇳", True,  "vi-VN"),
    LangMeta("uk",  "Ukrainian",          "Українська",           "🇺🇦", True,  "uk-UA"),
    LangMeta("cs",  "Czech",              "Čeština",              "🇨🇿", True,  "cs-CZ"),
    LangMeta("ro",  "Romanian",           "Română",               "🇷🇴", True,  "ro-RO"),
    LangMeta("hu",  "Hungarian",          "Magyar",               "🇭🇺", True,  "hu-HU"),
    LangMeta("el",  "Greek",              "Ελληνικά",             "🇬🇷", True,  "el-GR"),
    LangMeta("he",  "Hebrew",             "עברית",                "🇮🇱", True,  "he-IL"),
    LangMeta("fa",  "Persian",            "فارسی",                "🇮🇷", False, "fa-IR"),
    LangMeta("sw",  "Swahili",            "Kiswahili",            "🇰🇪", False, "sw-KE"),
    LangMeta("af",  "Afrikaans",          "Afrikaans",            "🇿🇦", True,  "af-ZA"),
    LangMeta("ca",  "Catalan",            "Català",               "🏴", True,  "ca-ES"),
    LangMeta("sk",  "Slovak",             "Slovenčina",           "🇸🇰", False, "sk-SK"),
    LangMeta("hr",  "Croatian",           "Hrvatski",             "🇭🇷", False, "hr-HR"),
    LangMeta("bg",  "Bulgarian",          "Български",            "🇧🇬", False, "bg-BG"),
    LangMeta("lt",  "Lithuanian",         "Lietuvių",             "🇱🇹", False, "lt-LT"),
    LangMeta("lv",  "Latvian",            "Latviešu",             "🇱🇻", False, "lv-LV"),
    LangMeta("et",  "Estonian",           "Eesti",                "🇪🇪", False, "et-EE"),
    LangMeta("sl",  "Slovenian",          "Slovenščina",          "🇸🇮", False, "sl-SI"),
]

# Lookup helpers
_BY_CODE: dict[str, LangMeta] = {lang.code: lang for lang in LANGUAGES}


def get_language(code: str) -> LangMeta | None:
    """Return LangMeta by base code (case-insensitive)."""
    return _BY_CODE.get(code.lower().split("-")[0])


def get_language_name(code: str) -> str:
    meta = get_language(code)
    return meta.name if meta else code.upper()
