import type { LucideIcon } from 'lucide-react'

export type PracticeMode = 'scenario' | 'freeTalk' | 'grammar' | 'plan' | 'vocabulary' | 'progress'
export type LearnerLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type Scenario = {
  id: string
  apiId: string
  titleZh: string
  titleEn: string
  level: string
  descriptionZh: string
  descriptionEn: string
  characterName: string
  characterRole: string
  personality: string
  openingMessage: string
  systemPrompt: string
  image: string
  accent: string
  skills: string[]
}

export type FeatureLink = {
  title: string
  label: string
  description: string
  to: string
  icon: LucideIcon
}

export type ChatMessage = {
  id: string
  role: 'coach' | 'learner'
  text: string
}

export type VocabularyItem = {
  phrase: string
  meaning: string
  example: string
}

export type DrillItem = {
  title: string
  prompt: string
}

export type PlanItem = {
  day: string
  task: string
}

export type CorrectionItem = {
  issue: string
  suggestion: string
  reason: string
}

export type PronunciationFeedback = {
  score: number
  confidence: string
  advice: string
}

export type QuantMetrics = {
  fluency: number
  pronunciation: number
  grammar: number
  vocabulary: number
  interaction: number
  responseLatencyMs: number | null
  speakingPace: string
  wordCount: number
}

export type SessionSummary = {
  headline: string
  nextStep: string
  homework: string[]
}

export type CoachFeedback = {
  score: number
  level: 'Needs practice' | 'Developing' | 'Clear' | 'Confident'
  focusArea: string
  strengths: string[]
  improvements: string[]
  suggestedRewrite: string
  coachReply: string
  nextPrompt: string
  vocabulary: VocabularyItem[]
  drills: DrillItem[]
  studyPlan: PlanItem[]
  pronunciation: PronunciationFeedback
  metrics: QuantMetrics
  corrections: CorrectionItem[]
  sessionSummary: SessionSummary
  provider: {
    source: 'model' | 'fallback'
    model: string
    label: string
    error?: string
  }
}

export type RuntimeStatus = {
  configured: boolean
  model: string
  provider: string
  source: 'model' | 'fallback'
}

export type SpeechMetrics = {
  inputMethod: 'text' | 'voice'
  recognitionConfidence: number | null
  startedAt: number | null
  endedAt: number | null
}

export type SpeechRecognitionAlternativeLike = {
  transcript: string
  confidence?: number
}

export type SpeechRecognitionResultLike = {
  [index: number]: SpeechRecognitionAlternativeLike
  isFinal?: boolean
}

export type SpeechRecognitionResultEventLike = Event & {
  resultIndex?: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

export type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  start: () => void
  stop: () => void
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}
