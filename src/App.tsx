import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Copy,
  Gauge,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import heroImage from './assets/hero.png'
import './App.css'

type ApiStatus = 'checking' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'
type PracticeMode = 'scenario' | 'freeTalk' | 'grammar' | 'plan' | 'vocabulary'
type LearnerLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

type Scenario = {
  id: string
  title: string
  level: string
  goal: string
  opening: string
  skills: string[]
  sample: string
}

type ModeConfig = {
  id: PracticeMode
  title: string
  label: string
  goal: string
  opening: string
  placeholder: string
  icon: LucideIcon
}

type Message = {
  id: string
  role: 'coach' | 'learner'
  text: string
}

type VocabularyItem = {
  phrase: string
  meaning: string
  example: string
}

type DrillItem = {
  title: string
  prompt: string
}

type PlanItem = {
  day: string
  task: string
}

type CorrectionItem = {
  issue: string
  suggestion: string
  reason: string
}

type PronunciationFeedback = {
  score: number
  confidence: string
  advice: string
}

type QuantMetrics = {
  fluency: number
  pronunciation: number
  grammar: number
  vocabulary: number
  interaction: number
  responseLatencyMs: number | null
  speakingPace: string
  wordCount: number
}

type SessionSummary = {
  headline: string
  nextStep: string
  homework: string[]
}

type CoachFeedback = {
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

type RuntimeStatus = {
  configured: boolean
  model: string
  provider: string
  source: 'model' | 'fallback'
}

type HealthResponse = {
  ai?: RuntimeStatus
  time?: string
}

type SpeechRecognitionAlternativeLike = {
  transcript: string
  confidence?: number
}

type SpeechRecognitionResultLike = {
  [index: number]: SpeechRecognitionAlternativeLike
}

type SpeechRecognitionResultEventLike = Event & {
  resultIndex?: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type SpeechMetrics = {
  inputMethod: 'text' | 'voice'
  recognitionConfidence: number | null
  startedAt: number | null
  endedAt: number | null
}

type PracticeHistoryItem = {
  id: string
  time: string
  modeTitle: string
  score: number
  pronunciationScore: number
  provider: 'model' | 'fallback'
  focusArea: string
}

type ReadinessItem = {
  label: string
  complete: boolean
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const scenarios: Scenario[] = [
  {
    id: 'travel',
    title: '机场值机',
    level: 'A2-B1',
    goal: '练习办理登机、座位、行李和礼貌询问。',
    opening: 'Welcome to Skylane Airlines. May I see your passport and booking reference?',
    skills: ['polite request', 'travel vocabulary', 'follow-up question'],
    sample: 'Could you please help me check in? I have one suitcase and I would like an aisle seat.',
  },
  {
    id: 'interview',
    title: '面试自我介绍',
    level: 'B1-B2',
    goal: '练习用具体经历回答问题，并把结果讲清楚。',
    opening: 'Tell me about yourself and one project you are proud of.',
    skills: ['STAR answer', 'specific example', 'impact'],
    sample: 'In my last project, I built a dashboard that helped the team compare user feedback faster.',
  },
  {
    id: 'daily',
    title: '咖啡店点单',
    level: 'A1-B1',
    goal: '练习日常点单、偏好表达和自然追问。',
    opening: 'Hi, what can I get for you today?',
    skills: ['ordering', 'preference', 'small talk'],
    sample: 'I would like a latte, please. Could you make it less sweet?',
  },
  {
    id: 'presentation',
    title: '项目路演开场',
    level: 'B1-B2',
    goal: '练习清晰介绍问题、方案和下一步。',
    opening: 'Please give me a short opening for your project presentation.',
    skills: ['structure', 'clarity', 'confidence'],
    sample: 'Today I will introduce an English speaking coach that gives instant feedback after each answer.',
  },
]

const modes: ModeConfig[] = [
  {
    id: 'scenario',
    title: '场景陪练',
    label: 'Role-play',
    goal: '真实场景对话、即时反馈和下一轮追问。',
    opening: '',
    placeholder: 'Answer the coach in English.',
    icon: MessageSquareText,
  },
  {
    id: 'freeTalk',
    title: '自由对话',
    label: 'Free talk',
    goal: '围绕任意话题自然聊天，训练追问和表达延展。',
    opening: 'Let us talk freely. What is something you worked on or enjoyed recently?',
    placeholder: 'Tell me anything you want to discuss, then ask a follow-up question.',
    icon: Brain,
  },
  {
    id: 'grammar',
    title: '语法表达诊断',
    label: 'Clinic',
    goal: '检查语法、措辞和中式英语，并给出自然改写。',
    opening: 'Paste or say one sentence. I will diagnose the expression and make it natural.',
    placeholder: 'I very like this project because it can help me speaking English.',
    icon: Wand2,
  },
  {
    id: 'plan',
    title: '学习计划',
    label: 'Plan',
    goal: '根据目标、水平和时间生成可执行的口语训练路径。',
    opening: 'Tell me your English goal, available time, and what feels hardest right now.',
    placeholder: 'I need to prepare for interviews in two weeks, and I can practice 20 minutes every day.',
    icon: CalendarDays,
  },
  {
    id: 'vocabulary',
    title: '词汇短语库',
    label: 'Phrases',
    goal: '围绕主题生成可直接开口使用的短语和练习。',
    opening: 'Tell me a topic. I will give you useful phrases and help you use them in speech.',
    placeholder: 'Give me useful phrases for explaining a project in an interview.',
    icon: BookOpen,
  },
]

const levels: LearnerLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const preferredVoiceNames = [
  'samantha',
  'jenny',
  'aria',
  'serena',
  'victoria',
  'ava',
  'susan',
  'allison',
  'salli',
  'zira',
  'karen',
  'moira',
  'tessa',
  'google us english',
  'google uk english female',
]

function getNowMs() {
  return Math.round(performance.timeOrigin + performance.now())
}

function formatHistoryTime(timestampMs: number) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestampMs))
}

function countEnglishWords(text: string) {
  return text.match(/[a-z']+/gi)?.length ?? 0
}

function getTargetWordCount(level: LearnerLevel, mode: PracticeMode) {
  if (mode === 'grammar' || mode === 'vocabulary') {
    return 8
  }

  const targets: Record<LearnerLevel, number> = {
    A1: 6,
    A2: 8,
    B1: 12,
    B2: 16,
    C1: 18,
  }

  return targets[level]
}

function createReadinessItems(text: string, mode: PracticeMode, targetWords: number): ReadinessItem[] {
  const trimmedText = text.trim()
  const wordCount = countEnglishWords(trimmedText)
  const hasSentenceEnding = /[.!?]$/.test(trimmedText)
  const hasConnector = /\b(because|also|and|but|so|for example|then)\b/i.test(trimmedText)
  const hasQuestion = trimmedText.includes('?')

  return [
    {
      label: `${wordCount}/${targetWords} words`,
      complete: wordCount >= targetWords,
    },
    {
      label: mode === 'grammar' ? 'Clear sentence' : 'Full sentence',
      complete: wordCount >= Math.min(targetWords, 8) && hasSentenceEnding,
    },
    {
      label: mode === 'plan' || mode === 'vocabulary' || mode === 'grammar' ? 'Useful detail' : 'Follow-up or reason',
      complete:
        mode === 'scenario' || mode === 'freeTalk'
          ? hasQuestion || hasConnector
          : wordCount >= targetWords && hasConnector,
    },
  ]
}

function createSummaryText(feedback: CoachFeedback, modeTitle: string) {
  return [
    `SpeakPilot practice summary`,
    `Mode: ${modeTitle}`,
    `Score: ${feedback.score}`,
    `Level: ${feedback.level}`,
    `Focus: ${feedback.focusArea}`,
    '',
    `Better version:`,
    feedback.suggestedRewrite,
    '',
    `Next step:`,
    feedback.sessionSummary.nextStep,
    '',
    `Homework:`,
    ...feedback.sessionSummary.homework.map((item, index) => `${index + 1}. ${item}`),
  ].join('\n')
}

function getSweetVoiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (lang.startsWith('en-us')) score += 40
  else if (lang.startsWith('en-gb')) score += 32
  else if (lang.startsWith('en')) score += 24

  preferredVoiceNames.forEach((preferredName, index) => {
    if (name.includes(preferredName)) {
      score += 80 - index * 2
    }
  })

  if (name.includes('female')) score += 16
  if (name.includes('natural')) score += 12
  if (name.includes('premium')) score += 10
  if (name.includes('compact')) score -= 18
  if (name.includes('male')) score -= 20

  return score
}

function pickCoachVoice(voices: SpeechSynthesisVoice[], selectedVoiceURI: string) {
  const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceURI)

  if (selectedVoice) {
    return selectedVoice
  }

  return [...voices].sort((a, b) => getSweetVoiceScore(b) - getSweetVoiceScore(a))[0]
}

function sortVoiceOptions(voices: SpeechSynthesisVoice[]) {
  return [...voices].sort((a, b) => getSweetVoiceScore(b) - getSweetVoiceScore(a))
}

const initialFeedback: CoachFeedback = {
  score: 0,
  level: 'Developing',
  focusArea: 'Waiting for your first answer',
  strengths: ['Start with one full sentence.'],
  improvements: ['Speak or type your answer, then send it for coach feedback.'],
  suggestedRewrite: 'Your improved sentence will appear here.',
  coachReply: '',
  nextPrompt: 'Answer the coach prompt in English.',
  vocabulary: [
    {
      phrase: 'Could you please...',
      meaning: '礼貌提出请求',
      example: 'Could you please give me one example?',
    },
  ],
  drills: [
    {
      title: 'One more detail',
      prompt: 'Answer once, then add one specific detail.',
    },
  ],
  studyPlan: [
    {
      day: 'Today',
      task: 'Say one answer aloud and send it for feedback.',
    },
  ],
  pronunciation: {
    score: 0,
    confidence: 'Waiting for voice input',
    advice: 'Use Speak to capture pronunciation signals.',
  },
  metrics: {
    fluency: 0,
    pronunciation: 0,
    grammar: 0,
    vocabulary: 0,
    interaction: 0,
    responseLatencyMs: null,
    speakingPace: 'Waiting',
    wordCount: 0,
  },
  corrections: [
    {
      issue: 'Waiting',
      suggestion: 'Send an answer to get correction timing.',
      reason: 'Corrections will appear immediately after each turn.',
    },
  ],
  sessionSummary: {
    headline: 'No session yet.',
    nextStep: 'Send your first answer.',
    homework: ['Complete one speaking turn.'],
  },
  provider: {
    source: 'fallback',
    model: 'waiting',
    label: 'Not checked',
  },
}

function App() {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('scenario')
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id)
  const [targetLevel, setTargetLevel] = useState<LearnerLevel>('B1')
  const [goal, setGoal] = useState('Speak more naturally in real conversations')
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [apiTime, setApiTime] = useState('')
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<CoachFeedback>(initialFeedback)
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>(() =>
    'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [],
  )
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics>({
    inputMethod: 'text',
    recognitionConfidence: null,
    startedAt: null,
    endedAt: null,
  })
  const [speechSupported] = useState(() =>
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  )
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const currentScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0],
    [selectedScenarioId],
  )
  const currentMode = useMemo(
    () => modes.find((mode) => mode.id === selectedMode) ?? modes[0],
    [selectedMode],
  )
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages(modes[0], scenarios[0]),
  )
  const sortedVoices = useMemo(() => sortVoiceOptions(availableVoices), [availableVoices])
  const selectedCoachVoice = useMemo(
    () => pickCoachVoice(availableVoices, selectedVoiceURI),
    [availableVoices, selectedVoiceURI],
  )
  const draftTargetWords = getTargetWordCount(targetLevel, currentMode.id)
  const draftReadinessItems = createReadinessItems(draft, currentMode.id, draftTargetWords)
  const draftReadinessScore = Math.round(
    (draftReadinessItems.filter((item) => item.complete).length / draftReadinessItems.length) * 100,
  )
  const currentSessionTitle = currentMode.id === 'scenario' ? currentScenario.title : currentMode.title
  const canCopySummary = feedback.score > 0 && copyStatus !== 'copied'

  useEffect(() => {
    const controller = new AbortController()

    async function checkApi() {
      try {
        setApiStatus('checking')
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('API health check failed')
        }

        const data = (await response.json()) as HealthResponse
        setApiStatus('ready')
        setRuntime(data.ai ?? null)
        setApiTime(data.time ?? '')
      } catch {
        if (!controller.signal.aborted) {
          setApiStatus('error')
        }
      }
    }

    checkApi()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return undefined
    }

    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices())
    const timeoutId = window.setTimeout(loadVoices, 120)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.clearTimeout(timeoutId)
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const canSubmit = draft.trim().length > 0 && !isSubmitting
  const statusLabel =
    apiStatus === 'ready'
      ? runtime?.configured
        ? 'Model Ready'
        : 'Local Coach'
      : apiStatus === 'checking'
        ? 'Checking'
        : 'API Error'

  async function submitAnswer() {
    const learnerText = draft.trim()

    if (!learnerText) {
      return
    }

    const learnerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'learner',
      text: learnerText,
    }

    setMessages((currentMessages) => [...currentMessages, learnerMessage])
    setDraft('')
    setIsSubmitting(true)

    try {
      const requestStartedAt = getNowMs()
      const response = await fetch('/api/coach/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: selectedMode,
          scenarioId: currentScenario.id,
          scenarioTitle: currentMode.id === 'scenario' ? currentScenario.title : currentMode.title,
          learnerText,
          targetLevel,
          goal,
          speech: speechMetrics,
          history: [...messages, learnerMessage].slice(-10).map(({ role, text }) => ({
            role,
            text,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Feedback request failed')
      }

      const nextFeedback = (await response.json()) as CoachFeedback
      const enrichedFeedback: CoachFeedback = {
        ...nextFeedback,
        metrics: {
          ...nextFeedback.metrics,
          responseLatencyMs: getNowMs() - requestStartedAt,
        },
      }
      const coachMessage: Message = {
        id: crypto.randomUUID(),
        role: 'coach',
        text: enrichedFeedback.coachReply,
      }

      setFeedback(enrichedFeedback)
      setCopyStatus('idle')
      setPracticeHistory((currentHistory) =>
        [
          {
            id: crypto.randomUUID(),
            time: formatHistoryTime(getNowMs()),
            modeTitle: currentMode.id === 'scenario' ? currentScenario.title : currentMode.title,
            score: enrichedFeedback.score,
            pronunciationScore: enrichedFeedback.pronunciation.score,
            provider: enrichedFeedback.provider.source,
            focusArea: enrichedFeedback.focusArea,
          },
          ...currentHistory,
        ].slice(0, 5),
      )
      setMessages((currentMessages) => [...currentMessages, coachMessage])
      setRuntime({
        configured: enrichedFeedback.provider.source === 'model',
        model: enrichedFeedback.provider.model,
        provider: enrichedFeedback.provider.label,
        source: enrichedFeedback.provider.source,
      })
      if (autoSpeak) {
        speakCoachReply(enrichedFeedback.coachReply)
      }
    } catch {
      setApiStatus('error')
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'coach',
          text: 'I cannot reach the coach service right now. Please check the local API and try again.',
        },
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleListening() {
    if (isListening) {
      stopListening()
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!Recognition) {
      return
    }

    const recognition = new Recognition()
    const startedAt = getNowMs()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    setSpeechMetrics({
      inputMethod: 'voice',
      recognitionConfidence: null,
      startedAt,
      endedAt: null,
    })
    recognition.onresult = (event) => {
      let transcript = ''
      let confidenceTotal = 0
      let confidenceCount = 0
      const startIndex = event.resultIndex ?? 0

      for (let index = startIndex; index < event.results.length; index += 1) {
        const alternative = event.results[index][0]
        transcript += alternative.transcript
        if (typeof alternative.confidence === 'number') {
          confidenceTotal += alternative.confidence
          confidenceCount += 1
        }
      }

      setDraft(transcript.trim())
      setSpeechMetrics((currentMetrics) => ({
        ...currentMetrics,
        recognitionConfidence:
          confidenceCount > 0 ? confidenceTotal / confidenceCount : currentMetrics.recognitionConfidence,
      }))
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => {
      setIsListening(false)
      setSpeechMetrics((currentMetrics) => ({
        ...currentMetrics,
        endedAt: currentMetrics.endedAt ?? getNowMs(),
      }))
    }
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setSpeechMetrics((currentMetrics) => ({
      ...currentMetrics,
      endedAt: currentMetrics.endedAt ?? getNowMs(),
    }))
  }

  function speakCoachReply(text: string) {
    if (!('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.voice = selectedCoachVoice ?? null
    utterance.rate = 0.88
    utterance.pitch = 1.16
    utterance.volume = 0.95
    window.speechSynthesis.speak(utterance)
  }

  function resetPractice() {
    setMessages(createInitialMessages(currentMode, currentScenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    window.speechSynthesis?.cancel()
    stopListening()
  }

  function selectMode(mode: ModeConfig) {
    setSelectedMode(mode.id)
    setMessages(createInitialMessages(mode, currentScenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    window.speechSynthesis?.cancel()
    stopListening()
  }

  function selectScenario(scenario: Scenario) {
    setSelectedScenarioId(scenario.id)
    setMessages(createInitialMessages(currentMode, scenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    window.speechSynthesis?.cancel()
    stopListening()
  }

  async function copySessionSummary() {
    if (feedback.score <= 0) {
      return
    }

    try {
      await navigator.clipboard.writeText(createSummaryText(feedback, currentSessionTitle))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="app status">
        <div className="brand-mark">
          <img alt="" src={heroImage} />
          <div>
            <span>SpeakPilot</span>
            <strong>英语口语教练</strong>
          </div>
        </div>
        <div className={`api-badge ${apiStatus} ${runtime?.source ?? 'fallback'}`}>
          <span>{statusLabel}</span>
          <small>{runtime ? `${runtime.provider} · ${runtime.model}` : apiTime || 'localhost:8787'}</small>
        </div>
      </section>

      <section className="practice-layout" aria-label="speaking practice workspace">
        <aside className="control-panel">
          <div className="section-heading">
            <p>Coach Mode</p>
            <h1>训练模式</h1>
          </div>

          <div className="mode-list">
            {modes.map((mode) => {
              const Icon = mode.icon

              return (
                <button
                  className={`mode-card ${mode.id === currentMode.id ? 'selected' : ''}`}
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{mode.title}</span>
                  <small>{mode.label}</small>
                </button>
              )
            })}
          </div>

          <div className="level-panel">
            <div className="mini-heading">
              <Gauge size={16} />
              <span>Level</span>
            </div>
            <div className="level-row" aria-label="target level">
              {levels.map((level) => (
                <button
                  className={level === targetLevel ? 'selected' : ''}
                  key={level}
                  onClick={() => setTargetLevel(level)}
                  type="button"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="goal-panel">
            <Target size={18} />
            <div>
              <strong>{currentMode.goal}</strong>
              <textarea
                aria-label="learning goal"
                onChange={(event) => setGoal(event.target.value)}
                rows={3}
                value={goal}
              />
            </div>
          </div>

          <div className="scenario-list compact">
            {scenarios.map((scenario) => (
              <button
                className={`scenario-card ${scenario.id === currentScenario.id ? 'selected' : ''}`}
                key={scenario.id}
                onClick={() => selectScenario(scenario)}
                type="button"
              >
                <span>{scenario.title}</span>
                <small>{scenario.level}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="conversation-panel" aria-labelledby="conversation-title">
          <div className="panel-title-row">
            <div className="section-heading">
              <p>{currentMode.label}</p>
              <h2 id="conversation-title">
                {currentMode.id === 'scenario' ? currentScenario.title : currentMode.title}
              </h2>
            </div>
            <button className="icon-button" onClick={resetPractice} title="重置练习" type="button">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="message-list" aria-live="polite">
            {messages.map((message) => (
              <article className={`message ${message.role}`} key={message.id}>
                <span>{message.role === 'coach' ? 'Coach' : 'You'}</span>
                <p>{message.text}</p>
              </article>
            ))}
            {isSubmitting ? (
              <article className="message coach loading">
                <span>Coach</span>
                <p>
                  <Loader2 className="spin-icon" size={16} />
                  Creating coach feedback
                </p>
              </article>
            ) : null}
          </div>

          <div className="composer">
            <textarea
              onChange={(event) => {
                setDraft(event.target.value)
                if (!isListening) {
                  setSpeechMetrics({
                    inputMethod: 'text',
                    recognitionConfidence: null,
                    startedAt: null,
                    endedAt: null,
                  })
                }
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  void submitAnswer()
                }
              }}
              placeholder={currentMode.id === 'scenario' ? currentScenario.sample : currentMode.placeholder}
              rows={4}
              value={draft}
            />
            <div className="draft-readiness" aria-label="answer readiness">
              <div className="readiness-heading">
                <span>Answer check</span>
                <strong>{draftReadinessScore}%</strong>
              </div>
              <div className="readiness-meter" aria-hidden="true">
                <span style={{ width: `${draftReadinessScore}%` }} />
              </div>
              <ul>
                {draftReadinessItems.map((item) => (
                  <li className={item.complete ? 'complete' : ''} key={item.label}>
                    <CheckCircle2 size={14} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="composer-actions">
              <button
                className={`voice-button ${isListening ? 'recording' : ''}`}
                disabled={!speechSupported}
                onClick={toggleListening}
                title={speechSupported ? '语音输入' : '当前浏览器不支持语音输入'}
                type="button"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isListening ? 'Listening' : 'Speak'}</span>
              </button>
              <button
                className={`audio-button ${autoSpeak ? 'active' : ''}`}
                onClick={() => {
                  setAutoSpeak((currentValue) => !currentValue)
                  if (autoSpeak) {
                    window.speechSynthesis?.cancel()
                  }
                }}
                title="自动朗读教练回复"
                type="button"
              >
                {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>{autoSpeak ? 'Voice on' : 'Voice off'}</span>
              </button>
              <select
                aria-label="coach voice"
                className="voice-select"
                onChange={(event) => {
                  setSelectedVoiceURI(event.target.value)
                  if (event.target.value) {
                    speakCoachReply('Hi, I am your English speaking coach. Let us practice together.')
                  }
                }}
                title="选择教练朗读声音"
                value={selectedVoiceURI}
              >
                <option value="">
                  {selectedCoachVoice ? `Sweet auto · ${selectedCoachVoice.name}` : 'Sweet auto'}
                </option>
                {sortedVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))}
              </select>
              <button className="primary-button" disabled={!canSubmit} onClick={submitAnswer} type="button">
                {isSubmitting ? <Loader2 className="spin-icon" size={18} /> : <Send size={18} />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="feedback-panel" aria-label="feedback">
          <div className="score-card">
            <div>
              <p>Score</p>
              <strong>{feedback.score || '--'}</strong>
            </div>
            <span>{feedback.level}</span>
          </div>

          <div className="provider-card">
            <Sparkles size={18} />
            <div>
              <p>{feedback.provider.source === 'model' ? 'Model Coach' : 'Fallback Coach'}</p>
              <strong>{feedback.provider.model}</strong>
              {feedback.provider.error ? <small>{feedback.provider.error}</small> : null}
            </div>
          </div>

          <section className="pronunciation-card">
            <div>
              <p>Pronunciation</p>
              <strong>{feedback.pronunciation.score || '--'}</strong>
            </div>
            <span>{feedback.pronunciation.confidence}</span>
            <small>{feedback.pronunciation.advice}</small>
          </section>

          <section className="metrics-grid" aria-label="quantified feedback">
            {[
              ['Fluency', feedback.metrics.fluency],
              ['Pronunciation', feedback.metrics.pronunciation],
              ['Grammar', feedback.metrics.grammar],
              ['Vocabulary', feedback.metrics.vocabulary],
              ['Interaction', feedback.metrics.interaction],
            ].map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
            <article>
              <span>Latency</span>
              <strong>
                {feedback.metrics.responseLatencyMs === null
                  ? '--'
                  : `${Math.round(feedback.metrics.responseLatencyMs)}ms`}
              </strong>
            </article>
            <article>
              <span>Pace</span>
              <strong>{feedback.metrics.speakingPace}</strong>
            </article>
            <article>
              <span>Words</span>
              <strong>{feedback.metrics.wordCount}</strong>
            </article>
          </section>

          <section className="history-box">
            <div className="history-heading">
              <h3>Session History</h3>
              <button
                disabled={practiceHistory.length === 0}
                onClick={() => setPracticeHistory([])}
                type="button"
              >
                Clear
              </button>
            </div>
            <div className="history-list">
              {practiceHistory.length === 0 ? (
                <p>No practice turns yet.</p>
              ) : (
                practiceHistory.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.modeTitle}</strong>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.focusArea}</p>
                    <footer>
                      <span>Score {item.score}</span>
                      <span>Pron. {item.pronunciationScore}</span>
                      <span>{item.provider === 'model' ? 'Model' : 'Fallback'}</span>
                    </footer>
                  </article>
                ))
              )}
            </div>
          </section>

          <div className="feedback-block focus">
            <Target size={18} />
            <div>
              <p>Focus</p>
              <strong>{feedback.focusArea}</strong>
            </div>
          </div>

          <section className="feedback-section">
            <h3>Strengths</h3>
            <ul>
              {feedback.strengths.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="feedback-section improve">
            <h3>Improve Next</h3>
            <ul>
              {feedback.improvements.map((item) => (
                <li key={item}>
                  <ArrowRight size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="correction-box">
            <h3>Corrections</h3>
            <div className="correction-list">
              {feedback.corrections.map((item) => (
                <article key={`${item.issue}-${item.suggestion}`}>
                  <span>{item.issue}</span>
                  <strong>{item.suggestion}</strong>
                  <p>{item.reason}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rewrite-box">
            <h3>Better Version</h3>
            <p>{feedback.suggestedRewrite}</p>
          </section>

          <section className="phrase-box">
            <h3>Useful Phrases</h3>
            <div className="phrase-list">
              {feedback.vocabulary.map((item) => (
                <article key={`${item.phrase}-${item.example}`}>
                  <strong>{item.phrase}</strong>
                  <span>{item.meaning}</span>
                  <p>{item.example}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="next-prompt">
            <h3>Practice Drills</h3>
            <div className="drill-list">
              {feedback.drills.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.prompt}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="plan-box">
            <h3>Study Plan</h3>
            <div className="plan-list">
              {feedback.studyPlan.map((item) => (
                <article key={`${item.day}-${item.task}`}>
                  <span>{item.day}</span>
                  <p>{item.task}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="summary-box">
            <div className="summary-heading">
              <h3>Class Summary</h3>
              <button
                disabled={!canCopySummary}
                onClick={copySessionSummary}
                title="复制本轮总结"
                type="button"
              >
                {copyStatus === 'copied' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                <span>
                  {copyStatus === 'copied'
                    ? 'Copied'
                    : copyStatus === 'error'
                      ? 'Retry'
                      : 'Copy'}
                </span>
              </button>
            </div>
            <strong>{feedback.sessionSummary.headline}</strong>
            <p>{feedback.sessionSummary.nextStep}</p>
            <ul>
              {feedback.sessionSummary.homework.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}

function createInitialMessages(mode: ModeConfig, scenario: Scenario): Message[] {
  return [
    {
      id: `${mode.id}-${scenario.id}-opening`,
      role: 'coach',
      text: mode.id === 'scenario' ? scenario.opening : mode.opening,
    },
  ]
}

export default App
