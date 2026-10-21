import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a timestamp (ms) to a relative or absolute label */
export function formatTimestamp(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Count words in a string */
export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/** Count characters */
export function charCount(text: string): number {
  return text.length
}

/** Approximate reading time label */
export function readingTime(text: string): string {
  const words = wordCount(text)
  const secs = Math.ceil((words / 200) * 60)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  return `${mins} min`
}

/** Truncate a string to maxLen with ellipsis */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

/** Generate a unique ID */
export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Convert base64 audio to a Blob URL */
export function base64ToAudioUrl(base64: string, format: string = 'mp3'): string {
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
  }
  const mime = mimeMap[format] ?? 'audio/mpeg'
  const byteChars = atob(base64)
  const byteArr = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteArr[i] = byteChars.charCodeAt(i)
  }
  const blob = new Blob([byteArr], { type: mime })
  return URL.createObjectURL(blob)
}

/** Download a text string as a .txt file */
export function downloadText(content: string, filename: string = 'translation.txt') {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Download audio Blob URL */
export function downloadAudio(url: string, filename: string = 'polyvoice-audio.mp3') {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

/** Copy text to clipboard, returns true on success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Example paragraphs for the demo */
export const EXAMPLE_TEXTS = [
  {
    label: 'English — Shakespeare',
    text: `To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.`,
  },
  {
    label: 'Hindi — Kabir',
    text: `दुख में सुमिरन सब करे, सुख में करे न कोय। जो सुख में सुमिरन करे, तो दुख काहे होय॥ कबीर दास जी ने जीवन के रहस्यों को अपने दोहों में बड़ी सरलता से समझाया है।`,
  },
  {
    label: 'Spanish — Cervantes',
    text: `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.`,
  },
  {
    label: 'French — Victor Hugo',
    text: `Aimer, c'est agir. La vie, c'est un voyage que l'on fait avec des amis du cœur. Il n'y a qu'un bonheur dans la vie, c'est d'aimer et d'être aimé.`,
  },
  {
    label: 'Japanese — Haiku',
    text: `古池や 蛙飛び込む 水の音。静けさの中に生命の躍動があり、松尾芭蕉はその瞬間を永遠に刻み込んだ。`,
  },
  {
    label: 'Arabic',
    text: `في البداية كانت الكلمة، والكلمة كانت مع الله. العلم نور والجهل ظلام. من طلب العلا سهر الليالي.`,
  },
]
