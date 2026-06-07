import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Copy,
  FileText,
  Flag,
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
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import heroImage from './assets/hero.png'
import sceneCafeImage from './assets/scene-cafe.svg'
import sceneInterviewImage from './assets/scene-interview.svg'
import scenePresentationImage from './assets/scene-presentation.svg'
import sceneTravelImage from './assets/scene-travel.svg'
import './App.css'

type ApiStatus = 'checking' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'
type VoiceFlowStatus = 'idle' | 'listening' | 'processing' | 'speaking'
type PracticeMode = 'scenario' | 'freeTalk' | 'grammar' | 'plan' | 'vocabulary'
type LearnerLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type CompanionTab = 'memory' | 'review' | 'chat'
type CompanionAction = 'idle' | 'wave' | 'hop' | 'sparkle'

type DialogOffset = {
  x: number
  y: number
}

type RoleDragState = {
  startX: number
  startY: number
  originX: number
  originY: number
  width: number
  height: number
}

type Scenario = {
  id: string
  title: string
  titleEn: string
  level: string
  descriptionZh: string
  goal: string
  opening: string
  openingMessage: string
  skills: string[]
  sample: string
  image: string
  avatarClass: string
  characterName: string
  characterRole: string
  personality: string
  voiceStyle: string
  systemPrompt: string
  exampleFollowUps: string[]
  reportProblems: string[]
  betterExpressions: Array<{
    lessNatural: string
    natural: string
  }>
  usefulSentences: string[]
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
  isFinal?: boolean
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
  maxAlternatives?: number
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

type CompanionTabConfig = {
  id: CompanionTab
  icon: LucideIcon
  label: string
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
    titleEn: 'Airport Check-in',
    level: 'A2-B1',
    descriptionZh: '练习办理登机、托运行李、选择座位、询问登机口和航班信息。',
    goal: '练习办理登机、座位、行李和礼貌询问。',
    opening: 'Good morning. Welcome to Skyway Airlines. May I see your passport and booking reference, please?',
    openingMessage:
      'Good morning. Welcome to Skyway Airlines. May I see your passport and booking reference, please?',
    skills: ['polite request', 'travel vocabulary', 'follow-up question'],
    sample: 'Could you please help me check in? I have one suitcase and I would like an aisle seat.',
    image: sceneTravelImage,
    avatarClass: 'emma-avatar',
    characterName: 'Emma',
    characterRole: 'Airport Ground Staff',
    personality: 'Polite, professional, patient, and slightly formal.',
    voiceStyle: 'Clear standard English with a slower pace.',
    systemPrompt:
      'You are Emma, a polite and professional airport ground staff member. The user is practicing English for airport check-in. Stay in character. Ask for passport and booking reference, checked luggage, seat preference, boarding gate, and boarding time. Use simple, natural English suitable for A2-B1 learners. Ask one question at a time. Do not overcorrect during the conversation. If the user makes a serious mistake, reformulate naturally. When the practice ends, provide feedback in Chinese with grammar, fluency, natural expressions, and useful airport sentences.',
    exampleFollowUps: [
      'How many bags would you like to check in?',
      'Would you prefer a window seat or an aisle seat?',
      'Do you have any liquids or power banks in your luggage?',
      'Your boarding gate is B12. Boarding starts at 10:35.',
    ],
    reportProblems: [
      '有些请求句还不够礼貌，可以多用 could / would like。',
      '机场场景里需要把行李、座位、登机口这些信息说完整。',
      '短句能表达意思，但需要加 please 让语气更自然。',
    ],
    betterExpressions: [
      {
        lessNatural: 'I want check in.',
        natural: "I'd like to check in, please.",
      },
      {
        lessNatural: 'I want window seat.',
        natural: "I'd like a window seat, please.",
      },
      {
        lessNatural: 'Where boarding?',
        natural: 'Where is the boarding gate?',
      },
    ],
    usefulSentences: [
      "I'd like to check in for my flight.",
      'Could I have a window seat, please?',
      'How many bags can I check in?',
      'Where is the boarding gate?',
      'What time does boarding start?',
    ],
  },
  {
    id: 'interview',
    title: '面试自我介绍',
    titleEn: 'Interview Self-introduction',
    level: 'B1-B2',
    descriptionZh: '练习英文面试开场、自我介绍、经历表达、优势说明和自然回答追问。',
    goal: '练习用具体经历回答问题，并把结果讲清楚。',
    opening:
      'Hi, nice to meet you. Thanks for joining the interview today. Could you please start by introducing yourself?',
    openingMessage:
      'Hi, nice to meet you. Thanks for joining the interview today. Could you please start by introducing yourself?',
    skills: ['STAR answer', 'specific example', 'impact'],
    sample: 'In my last project, I built a dashboard that helped the team compare user feedback faster.',
    image: sceneInterviewImage,
    avatarClass: 'james-avatar',
    characterName: 'James',
    characterRole: 'Hiring Manager',
    personality: 'Professional, friendly, structured, and curious.',
    voiceStyle: 'Natural interview English with a calm business tone.',
    systemPrompt:
      'You are James, a professional but friendly HR interviewer. The user is practicing English self-introduction for job interviews. Stay in character. Ask the user to introduce themselves, then ask follow-up questions about education, experience, projects, skills, motivation, and career goals. Keep the interview realistic. Ask one question at a time. Use B1-B2 level English. Do not give long explanations during the interview. When the practice ends, provide feedback in Chinese covering structure, clarity, grammar, vocabulary, confidence, and an improved self-introduction.',
    exampleFollowUps: [
      'Could you tell me more about that project?',
      'What was your specific role in the team?',
      'Why are you interested in this position?',
      'Can you give me an example?',
    ],
    reportProblems: [
      '自我介绍需要更清晰的结构，建议按教育背景、经历、技能、岗位动机展开。',
      '项目经历不要只说做了什么，还要说明你的角色和结果。',
      '回答可以更具体，少用泛泛的形容词。',
    ],
    betterExpressions: [
      {
        lessNatural: 'I joined one project and it is good.',
        natural: 'I worked on a project where I was responsible for user research and data analysis.',
      },
      {
        lessNatural: 'I am good at teamwork.',
        natural: 'I communicate clearly with teammates and take responsibility for my part of the work.',
      },
      {
        lessNatural: 'I want this job because I like it.',
        natural: 'I am interested in this role because it matches my experience in product research and communication.',
      },
    ],
    usefulSentences: [
      'I am currently studying...',
      'One project I am proud of is...',
      'My specific role was to...',
      'This experience helped me develop...',
      'I am interested in this position because...',
    ],
  },
  {
    id: 'daily',
    title: '咖啡店点单',
    titleEn: 'Coffee Shop Ordering',
    level: 'A1-B1',
    descriptionZh: '练习日常点单、表达偏好、修改饮品、询问价格、外带或堂食。',
    goal: '练习日常点单、偏好表达和自然追问。',
    opening: 'Hi, what can I get for you today?',
    openingMessage: 'Hi there! What can I get for you today?',
    skills: ['ordering', 'preference', 'small talk'],
    sample: 'I would like a latte, please. Could you make it less sweet?',
    image: sceneCafeImage,
    avatarClass: 'sophie-avatar',
    characterName: 'Sophie',
    characterRole: 'Barista',
    personality: 'Warm, relaxed, casual, and encouraging.',
    voiceStyle: 'Friendly everyday English at a comfortable speed.',
    systemPrompt:
      'You are Sophie, a friendly barista in a coffee shop. The user is practicing English for ordering coffee. Stay in character. Ask what they would like to order, size, hot or iced, milk choice, sugar, takeaway or dine-in, and tell the price at the end. Use simple casual English suitable for A1-B1 learners. Keep the conversation light and friendly. Do not correct too much during the order. When the practice ends, provide feedback in Chinese with natural ordering expressions.',
    exampleFollowUps: [
      'Would you like that hot or iced?',
      'What size would you like?',
      'Would you like regular milk, oat milk, or soy milk?',
      'Is that for here or to go?',
    ],
    reportProblems: [
      '点单时可以少用 I want，多用 Can I have / I would like。',
      '饮品细节要说完整，例如大小、冷热、奶的类型、堂食或外带。',
      '日常场景里语气可以更轻松，但仍然要礼貌。',
    ],
    betterExpressions: [
      {
        lessNatural: 'I want one coffee.',
        natural: 'Can I have a latte, please?',
      },
      {
        lessNatural: 'Give me cold coffee.',
        natural: "I'd like an iced latte, please.",
      },
      {
        lessNatural: 'Take away.',
        natural: 'Could I get that to go?',
      },
    ],
    usefulSentences: [
      'Can I have a latte, please?',
      "I'd like an iced latte with oat milk, please.",
      'Could I get that to go?',
      'What size do you recommend?',
      'How much is it altogether?',
    ],
  },
  {
    id: 'presentation',
    title: '项目路演开场',
    titleEn: 'Project Pitch Opening',
    level: 'B1-B2',
    descriptionZh: '练习英文项目介绍、presentation 开场、问题背景、解决方案和下一步计划。',
    goal: '练习清晰介绍问题、方案和下一步。',
    opening:
      "Hi, welcome. You have two minutes to introduce your project. Please start whenever you're ready.",
    openingMessage:
      "Hi, welcome. You have two minutes to introduce your project. Please start whenever you're ready.",
    skills: ['structure', 'clarity', 'confidence'],
    sample: 'Today I will introduce an English speaking coach that gives instant feedback after each answer.',
    image: scenePresentationImage,
    avatarClass: 'olivia-avatar',
    characterName: 'Olivia',
    characterRole: 'Project Judge',
    personality: 'Rational, focused, professional, and slightly challenging.',
    voiceStyle: 'Clear professional English with a confident tone.',
    systemPrompt:
      'You are Olivia, a professional project judge, mentor, or investor. The user is practicing the opening of an English project pitch. Stay in character. Ask the user to introduce the project in two minutes, then ask follow-up questions about the problem, target users, solution, competitors, business model, and next steps. Be professional and slightly challenging. Use B1-B2 level English. Ask one question at a time. Help the user improve clarity and structure. When the practice ends, provide feedback in Chinese covering pitch structure, logic, expression, conciseness, and an improved pitch opening.',
    exampleFollowUps: [
      'What problem are you trying to solve?',
      'Who is your target user?',
      'How is your solution different from existing products?',
      'What is your next milestone?',
    ],
    reportProblems: [
      '路演开场需要更简洁，先说问题和目标用户，再说解决方案。',
      '不要只介绍功能，也要说明为什么这个问题值得解决。',
      '表达可以更有逻辑，例如用 Problem, User, Solution, Difference, Next step。',
    ],
    betterExpressions: [
      {
        lessNatural: 'Our project is an app and it has many functions.',
        natural: 'Our project helps international students practice real-life English conversations before they happen.',
      },
      {
        lessNatural: 'The problem is English is hard.',
        natural: 'The key problem is that learners rarely get instant feedback in realistic speaking situations.',
      },
      {
        lessNatural: 'We are different because AI.',
        natural: 'We are different because the coach combines scenario role-play, correction, and measurable progress in one flow.',
      },
    ],
    usefulSentences: [
      'The key problem is...',
      'Our target users are...',
      'Our solution helps users...',
      'Compared with existing products, we...',
      'Our next milestone is...',
    ],
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
const companionTabs: CompanionTabConfig[] = [
  { id: 'memory', icon: BookOpen, label: '记忆' },
  { id: 'review', icon: Brain, label: '复习' },
  { id: 'chat', icon: MessageSquareText, label: '互动' },
]

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

const voiceFlowCopy: Record<VoiceFlowStatus, { label: string; hint: string }> = {
  idle: {
    label: 'Ready',
    hint: 'Press Speak to answer by voice.',
  },
  listening: {
    label: 'Listening',
    hint: 'Live transcript is updating.',
  },
  processing: {
    label: 'Sending',
    hint: 'Coach reply is being prepared.',
  },
  speaking: {
    label: 'Speaking',
    hint: 'Coach voice is playing.',
  },
}

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

function getStarterPhrases(mode: PracticeMode, scenarioId: string) {
  if (mode === 'freeTalk') {
    return ['Recently, I have been...', 'One reason is...', 'What do you think about...?']
  }

  if (mode === 'grammar') {
    return ['What I mean is...', 'I want to say that...', 'A more natural way is...']
  }

  if (mode === 'plan') {
    return ['My main goal is...', 'I can practice...', 'The hardest part is...']
  }

  if (mode === 'vocabulary') {
    return ['I want to use this phrase...', 'For example, I can say...', 'This phrase is useful because...']
  }

  const scenarioPhrases: Record<string, string[]> = {
    travel: ['Could you please check...', 'Would it be possible to...', 'I would like to confirm...'],
    interview: ['One project I am proud of is...', 'The result was...', 'I learned that...'],
    daily: ['I would like...', 'Could you recommend...', 'I would prefer...'],
    presentation: ['The key problem is...', 'Our solution is...', 'The next step is...'],
  }

  return scenarioPhrases[scenarioId] ?? scenarioPhrases.daily
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
  const [autoSubmitVoice, setAutoSubmitVoice] = useState(true)
  const [voiceFlowStatus, setVoiceFlowStatus] = useState<VoiceFlowStatus>('idle')
  const [companionOpen, setCompanionOpen] = useState(true)
  const [companionTab, setCompanionTab] = useState<CompanionTab>('memory')
  const [companionTipIndex, setCompanionTipIndex] = useState(0)
  const [companionAction, setCompanionAction] = useState<CompanionAction>('idle')
  const [roleScenarioId, setRoleScenarioId] = useState<string | null>(null)
  const [roleMessages, setRoleMessages] = useState<Message[]>([])
  const [roleDraft, setRoleDraft] = useState('')
  const [roleFeedback, setRoleFeedback] = useState<CoachFeedback | null>(null)
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false)
  const [isRoleEnded, setIsRoleEnded] = useState(false)
  const [isRoleListening, setIsRoleListening] = useState(false)
  const [isRoleSpeaking, setIsRoleSpeaking] = useState(false)
  const [roleAutoSpeak, setRoleAutoSpeak] = useState(true)
  const [roleDialogOffset, setRoleDialogOffset] = useState<DialogOffset>({ x: 0, y: 0 })
  const [isRoleDialogDragging, setIsRoleDialogDragging] = useState(false)
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
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const roleDialogRef = useRef<HTMLDivElement | null>(null)
  const roleMessageListRef = useRef<HTMLDivElement | null>(null)
  const roleRecognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const latestTranscriptRef = useRef('')
  const roleLatestTranscriptRef = useRef('')
  const shouldSubmitVoiceRef = useRef(false)
  const autoSubmitTimerRef = useRef<number | null>(null)
  const speechMetricsRef = useRef<SpeechMetrics>(speechMetrics)
  const isSubmittingRef = useRef(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const companionActionTimersRef = useRef<number[]>([])
  const roleDragRef = useRef<RoleDragState | null>(null)

  const currentScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0],
    [selectedScenarioId],
  )
  const activeRoleScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === roleScenarioId) ?? null,
    [roleScenarioId],
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
  const starterPhrases = useMemo(
    () => getStarterPhrases(currentMode.id, currentScenario.id),
    [currentMode.id, currentScenario.id],
  )
  const companionCards = useMemo(() => {
    const cards = [
      ...starterPhrases,
      currentScenario.sample,
      feedback.suggestedRewrite,
      feedback.nextPrompt,
    ].filter((item) => item && item !== initialFeedback.suggestedRewrite)

    return Array.from(new Set(cards)).slice(0, 6)
  }, [currentScenario.sample, feedback.nextPrompt, feedback.suggestedRewrite, starterPhrases])
  const draftTargetWords = getTargetWordCount(targetLevel, currentMode.id)
  const draftReadinessItems = createReadinessItems(draft, currentMode.id, draftTargetWords)
  const draftReadinessScore = Math.round(
    (draftReadinessItems.filter((item) => item.complete).length / draftReadinessItems.length) * 100,
  )
  const currentSessionTitle = currentMode.id === 'scenario' ? currentScenario.title : currentMode.title
  const canCopySummary = feedback.score > 0 && copyStatus !== 'copied'
  const voiceFlowState = voiceFlowCopy[voiceFlowStatus]
  const companionCard = companionCards[companionTipIndex % Math.max(companionCards.length, 1)] ?? currentScenario.sample
  const companionProgress =
    feedback.score > 0 ? Math.min(100, Math.round((feedback.score + draftReadinessScore) / 2)) : draftReadinessScore

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
    return () => {
      companionActionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    }
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

  useEffect(() => {
    speechMetricsRef.current = speechMetrics
  }, [speechMetrics])

  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  useEffect(() => {
    if (!isRoleDialogDragging) {
      return undefined
    }

    function handlePointerMove(event: PointerEvent) {
      const dragState = roleDragRef.current

      if (!dragState) {
        return
      }

      const nextOffset = clampDialogOffset(
        dragState.originX + event.clientX - dragState.startX,
        dragState.originY + event.clientY - dragState.startY,
        dragState.width,
        dragState.height,
      )
      setRoleDialogOffset(nextOffset)
    }

    function stopDragging() {
      roleDragRef.current = null
      setIsRoleDialogDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging, { once: true })
    window.addEventListener('pointercancel', stopDragging, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [isRoleDialogDragging])

  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current !== null) {
        window.clearTimeout(autoSubmitTimerRef.current)
        autoSubmitTimerRef.current = null
      }
      roleRecognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    const messageList = messageListRef.current

    if (!messageList) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [isSubmitting, messages.length])

  useEffect(() => {
    const messageList = roleMessageListRef.current

    if (!messageList) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [isRoleEnded, isRoleSubmitting, roleMessages.length])

  const canSubmit = draft.trim().length > 0 && !isSubmitting
  const canSubmitRole =
    roleDraft.trim().length > 0 && !isRoleSubmitting && !isRoleEnded && activeRoleScenario !== null
  const statusLabel =
    apiStatus === 'ready'
      ? runtime?.configured
        ? 'Model Ready'
        : 'Local Coach'
      : apiStatus === 'checking'
        ? 'Checking'
        : 'API Error'

  function clearAutoSubmitTimer() {
    if (autoSubmitTimerRef.current !== null) {
      window.clearTimeout(autoSubmitTimerRef.current)
      autoSubmitTimerRef.current = null
    }
  }

  function cancelCoachVoice(nextStatus: VoiceFlowStatus = 'idle') {
    window.speechSynthesis?.cancel()
    utteranceRef.current = null
    setVoiceFlowStatus(nextStatus)
  }

  async function submitAnswer(answerOverride?: string, speechOverride?: SpeechMetrics) {
    const learnerText = (answerOverride ?? draft).trim()

    if (!learnerText || isSubmittingRef.current) {
      return
    }

    clearAutoSubmitTimer()
    isSubmittingRef.current = true
    setVoiceFlowStatus('processing')
    const learnerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'learner',
      text: learnerText,
    }

    setMessages((currentMessages) => [...currentMessages, learnerMessage])
    setDraft('')
    latestTranscriptRef.current = ''
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
          speech: speechOverride ?? speechMetrics,
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
      } else {
        setVoiceFlowStatus('idle')
      }
    } catch {
      setApiStatus('error')
      setVoiceFlowStatus('idle')
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'coach',
          text: 'I cannot reach the coach service right now. Please check the local API and try again.',
        },
      ])
    } finally {
      isSubmittingRef.current = false
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
    clearAutoSubmitTimer()
    cancelCoachVoice('listening')
    latestTranscriptRef.current = draft.trim()
    shouldSubmitVoiceRef.current = autoSubmitVoice
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    setSpeechMetrics({
      inputMethod: 'voice',
      recognitionConfidence: null,
      startedAt,
      endedAt: null,
    })
    setVoiceFlowStatus('listening')
    recognition.onresult = (event) => {
      let transcript = ''
      let confidenceTotal = 0
      let confidenceCount = 0

      for (let index = 0; index < event.results.length; index += 1) {
        const alternative = event.results[index][0]
        transcript += `${alternative.transcript} `
        if (typeof alternative.confidence === 'number') {
          confidenceTotal += alternative.confidence
          confidenceCount += 1
        }
      }

      const nextTranscript = transcript.replace(/\s+/g, ' ').trim()
      latestTranscriptRef.current = nextTranscript
      setDraft(nextTranscript)
      setSpeechMetrics((currentMetrics) => ({
        ...currentMetrics,
        recognitionConfidence:
          confidenceCount > 0 ? confidenceTotal / confidenceCount : currentMetrics.recognitionConfidence,
      }))
    }
    recognition.onerror = () => {
      setIsListening(false)
      setVoiceFlowStatus('idle')
    }
    recognition.onend = () => {
      const endedAt = getNowMs()
      const completedMetrics = {
        ...speechMetricsRef.current,
        inputMethod: 'voice',
        startedAt,
        endedAt: speechMetricsRef.current.endedAt ?? endedAt,
      } satisfies SpeechMetrics

      recognitionRef.current = null
      setIsListening(false)
      setSpeechMetrics(completedMetrics)

      const finalTranscript = latestTranscriptRef.current.trim()
      if (shouldSubmitVoiceRef.current && autoSubmitVoice && finalTranscript) {
        setVoiceFlowStatus('processing')
        autoSubmitTimerRef.current = window.setTimeout(() => {
          void submitAnswer(finalTranscript, completedMetrics)
        }, 350)
        return
      }

      setVoiceFlowStatus('idle')
    }
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function stopListening(shouldSubmit = autoSubmitVoice) {
    shouldSubmitVoiceRef.current = shouldSubmit
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setSpeechMetrics((currentMetrics) => ({
      ...currentMetrics,
      endedAt: currentMetrics.endedAt ?? getNowMs(),
    }))
    if (!shouldSubmit) {
      clearAutoSubmitTimer()
      setVoiceFlowStatus('idle')
    }
  }

  function speakCoachReply(text: string) {
    if (!('speechSynthesis' in window)) {
      setVoiceFlowStatus('idle')
      return
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance
    utterance.lang = 'en-US'
    utterance.voice = selectedCoachVoice ?? null
    utterance.rate = 0.88
    utterance.pitch = 1.16
    utterance.volume = 0.95
    utterance.onstart = () => setVoiceFlowStatus('speaking')
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        setVoiceFlowStatus('idle')
      }
    }
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
      }
      setVoiceFlowStatus('idle')
    }
    window.speechSynthesis.speak(utterance)
  }

  function speakRoleReply(text: string, scenario: Scenario) {
    if (!('speechSynthesis' in window)) {
      setIsRoleSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
    const voiceSettings = getRoleVoiceSettings(scenario.id)
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance
    utterance.lang = voiceSettings.lang
    utterance.voice = selectedCoachVoice ?? null
    utterance.rate = voiceSettings.rate
    utterance.pitch = voiceSettings.pitch
    utterance.volume = 0.96
    utterance.onstart = () => setIsRoleSpeaking(true)
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
      }
      setIsRoleSpeaking(false)
    }
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
      }
      setIsRoleSpeaking(false)
    }
    window.speechSynthesis.speak(utterance)
  }

  function cancelRoleVoice() {
    window.speechSynthesis?.cancel()
    utteranceRef.current = null
    setIsRoleSpeaking(false)
  }

  function toggleRoleListening() {
    if (isRoleListening) {
      stopRoleListening()
      return
    }

    if (isRoleEnded) {
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!Recognition) {
      return
    }

    if (isListening) {
      stopListening(false)
    }

    clearAutoSubmitTimer()
    cancelCoachVoice()
    const recognition = new Recognition()
    roleLatestTranscriptRef.current = roleDraft.trim()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      let transcript = ''

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0].transcript} `
      }

      const nextTranscript = transcript.replace(/\s+/g, ' ').trim()
      roleLatestTranscriptRef.current = nextTranscript
      setRoleDraft(nextTranscript)
    }
    recognition.onerror = () => {
      roleRecognitionRef.current = null
      setIsRoleListening(false)
    }
    recognition.onend = () => {
      roleRecognitionRef.current = null
      setIsRoleListening(false)
    }
    try {
      roleRecognitionRef.current = recognition
      recognition.start()
      setIsRoleListening(true)
    } catch {
      roleRecognitionRef.current = null
      setIsRoleListening(false)
    }
  }

  function stopRoleListening() {
    roleRecognitionRef.current?.stop()
    roleRecognitionRef.current = null
    setIsRoleListening(false)
  }

  function toggleRoleAutoSpeak() {
    const nextAutoSpeak = !roleAutoSpeak
    setRoleAutoSpeak(nextAutoSpeak)

    if (!nextAutoSpeak) {
      cancelRoleVoice()
      return
    }

    if (activeRoleScenario) {
      const lastCoachMessage = [...roleMessages].reverse().find((message) => message.role === 'coach')
      speakRoleReply(lastCoachMessage?.text ?? activeRoleScenario.openingMessage, activeRoleScenario)
    }
  }

  function resetPractice() {
    setMessages(createInitialMessages(currentMode, currentScenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    latestTranscriptRef.current = ''
    cancelCoachVoice()
    stopListening(false)
  }

  function selectMode(mode: ModeConfig) {
    setSelectedMode(mode.id)
    setMessages(createInitialMessages(mode, currentScenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    latestTranscriptRef.current = ''
    cancelCoachVoice()
    stopListening(false)
  }

  function startRoleDialogDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    const dialog = roleDialogRef.current

    if (!dialog) {
      return
    }

    event.preventDefault()
    const rect = dialog.getBoundingClientRect()
    roleDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: roleDialogOffset.x,
      originY: roleDialogOffset.y,
      width: rect.width,
      height: rect.height,
    }
    setIsRoleDialogDragging(true)
  }

  function openRoleDialog(scenario: Scenario) {
    stopRoleListening()
    setSelectedMode('scenario')
    setSelectedScenarioId(scenario.id)
    setMessages(createInitialMessages(modes[0], scenario))
    setFeedback(initialFeedback)
    setCopyStatus('idle')
    setDraft('')
    latestTranscriptRef.current = ''
    cancelCoachVoice()
    stopListening(false)

    setRoleScenarioId(scenario.id)
    setRoleMessages([createRoleOpeningMessage(scenario)])
    setRoleDraft('')
    setRoleFeedback(null)
    setIsRoleEnded(false)
    setIsRoleSubmitting(false)
    setRoleDialogOffset({ x: 0, y: 0 })
    setIsRoleDialogDragging(false)
    roleDragRef.current = null
    if (roleAutoSpeak) {
      speakRoleReply(scenario.openingMessage, scenario)
    }
  }

  function closeRoleDialog() {
    stopRoleListening()
    cancelRoleVoice()
    setRoleScenarioId(null)
    setRoleMessages([])
    setRoleDraft('')
    setRoleFeedback(null)
    setIsRoleEnded(false)
    setIsRoleSubmitting(false)
    setIsRoleDialogDragging(false)
    roleDragRef.current = null
  }

  async function submitRoleAnswer() {
    const scenario = activeRoleScenario
    const learnerText = roleDraft.trim()

    if (!scenario || !learnerText || isRoleSubmitting || isRoleEnded) {
      return
    }

    stopRoleListening()
    const learnerMessage: Message = {
      id: crypto.randomUUID(),
      role: 'learner',
      text: learnerText,
    }
    const requestHistory = [...roleMessages, learnerMessage].slice(-10)

    setRoleMessages(requestHistory)
    setRoleDraft('')
    setIsRoleSubmitting(true)

    try {
      const requestStartedAt = getNowMs()
      const response = await fetch('/api/coach/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'scenario',
          scenarioId: scenario.id,
          scenarioTitle: scenario.titleEn,
          learnerText,
          targetLevel,
          goal: scenario.descriptionZh,
          roleName: scenario.characterName,
          rolePrompt: scenario.systemPrompt,
          speech: {
            inputMethod: 'text',
            recognitionConfidence: null,
            startedAt: null,
            endedAt: null,
          },
          history: requestHistory.map(({ role, text }) => ({
            role,
            text,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Role practice request failed')
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

      setRoleFeedback(enrichedFeedback)
      setRoleMessages((currentMessages) => [...currentMessages, coachMessage])
      setRuntime({
        configured: enrichedFeedback.provider.source === 'model',
        model: enrichedFeedback.provider.model,
        provider: enrichedFeedback.provider.label,
        source: enrichedFeedback.provider.source,
      })
      if (roleAutoSpeak) {
        speakRoleReply(enrichedFeedback.coachReply, scenario)
      }
    } catch {
      cancelRoleVoice()
      setRoleMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'coach',
          text: `${scenario.characterName} cannot reach the coach service right now. Please try again in a moment.`,
        },
      ])
    } finally {
      setIsRoleSubmitting(false)
    }
  }

  function finishRolePractice() {
    if (!activeRoleScenario || isRoleEnded) {
      return
    }

    stopRoleListening()
    setIsRoleEnded(true)
    cancelRoleVoice()
    setRoleMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: 'coach',
        text: `Thanks. Let's pause the ${activeRoleScenario.titleEn} practice here. Your feedback report is ready below.`,
      },
    ])
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

  function insertStarterPhrase(phrase: string) {
    setDraft((currentDraft) => {
      const trimmedDraft = currentDraft.trim()
      const nextDraft = trimmedDraft ? `${trimmedDraft} ${phrase}` : phrase
      latestTranscriptRef.current = nextDraft
      return nextDraft
    })
    setSpeechMetrics({
      inputMethod: 'text',
      recognitionConfidence: null,
      startedAt: null,
      endedAt: null,
    })
  }

  function loadDraftTemplate(text: string) {
    const nextDraft = text.trim()

    if (!nextDraft || nextDraft === initialFeedback.suggestedRewrite) {
      return
    }

    setDraft(nextDraft)
    latestTranscriptRef.current = nextDraft
    setSpeechMetrics({
      inputMethod: 'text',
      recognitionConfidence: null,
      startedAt: null,
      endedAt: null,
    })
  }

  function playCompanionAction() {
    companionActionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    companionActionTimersRef.current = []

    setCompanionAction('wave')
    companionActionTimersRef.current = [
      window.setTimeout(() => setCompanionAction('hop'), 260),
      window.setTimeout(() => setCompanionAction('sparkle'), 520),
      window.setTimeout(() => setCompanionAction('idle'), 1120),
    ]
  }

  function toggleCompanion() {
    playCompanionAction()
    setCompanionOpen((currentValue) => !currentValue)
  }

  function saveCompanionCard() {
    playCompanionAction()
    insertStarterPhrase(companionCard)
    document.getElementById('coach')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function startRecallPractice() {
    playCompanionAction()
    const recallPrompt = `I remember this phrase: ${companionCard}. I can use it when...`
    setDraft(recallPrompt)
    latestTranscriptRef.current = recallPrompt
    setSpeechMetrics({
      inputMethod: 'text',
      recognitionConfidence: null,
      startedAt: null,
      endedAt: null,
    })
    document.getElementById('coach')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="product-shell">
      <header className="product-nav">
        <a className="nav-brand" href="#product">
          <img alt="" src={heroImage} />
          <span>SpeakPilot</span>
        </a>
        <nav aria-label="product navigation">
          <a href="#product">Product</a>
          <a href="#scenarios">Scenarios</a>
          <a href="#workflow">Workflow</a>
          <a href="#coach">Coach</a>
          <a href="#feedback">Feedback</a>
        </nav>
        <a className="nav-cta" href="#coach">
          Start Practice
        </a>
      </header>

      <section className="product-hero product-page" id="product">
        <div className="hero-copy">
          <p>AI Speaking Coach</p>
          <h1>
            Your English,
            <span> under control</span>
          </h1>
          <strong>Practice real conversations, get instant correction, and hear a natural coach reply in one smooth flow.</strong>
          <div className="hero-actions">
            <a href="#coach">Open Coach</a>
            <a href="#scenarios">Explore Scenes</a>
          </div>
          <div className="hero-stats" aria-label="product highlights">
            <article>
              <span>5</span>
              <small>practice modes</small>
            </article>
            <article>
              <span>Live</span>
              <small>voice feedback</small>
            </article>
            <article>
              <span>100</span>
              <small>score target</small>
            </article>
          </div>
        </div>
        <div className="hero-visual" aria-label="speaking coach preview">
          <div className="hero-gradient-card">
            <div className="mock-toolbar">
              <span />
              <span />
              <span />
            </div>
            <div className="mock-prompt">airport check-in practice</div>
            <div className="mock-message coach">
              <span>Coach</span>
              <p>May I see your passport and booking reference?</p>
            </div>
            <div className="mock-message learner">
              <span>You</span>
              <p>I would like to check in and ask for an aisle seat.</p>
            </div>
            <div className="voice-orbit">
              <Volume2 size={34} />
            </div>
          </div>
        </div>
      </section>

      <section className="scenario-showcase product-page" id="scenarios">
        <div className="section-kicker">
          <p>Scenario Library</p>
          <h2>Jump into the exact conversation you need.</h2>
        </div>
        <div className="showcase-grid">
          {scenarios.map((scenario) => (
            <button
              className={`showcase-card ${scenario.id}`}
              key={`showcase-${scenario.id}`}
              onClick={() => openRoleDialog(scenario)}
              type="button"
            >
              <img alt="" src={scenario.image} />
              <div>
                <span>{scenario.level}</span>
                <strong>{scenario.title}</strong>
                <p>{scenario.goal}</p>
                <div className="showcase-character">
                  <RoleAvatar scenario={scenario} size="small" />
                  <span>
                    {scenario.characterName}
                    <small>{scenario.characterRole}</small>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="workflow-section product-page" id="workflow">
        <div className="workflow-copy">
          <p>Practice Flow</p>
          <h2>
            Speak once,
            <span> learn immediately.</span>
          </h2>
          <strong>
            The page keeps recognition, model response, voice playback, scoring, correction, and homework in one guided loop.
          </strong>
        </div>
        <div className="workflow-stack">
          <article>
            <span>01</span>
            <strong>Choose a mode</strong>
            <p>Role-play, free talk, grammar clinic, phrase builder, or study plan.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Speak or type</strong>
            <p>Live transcript and answer checks keep each turn focused.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Review feedback</strong>
            <p>Scores, corrections, useful phrases, and next practice steps appear after each turn.</p>
          </article>
        </div>
      </section>

      <section className="app-shell practice-section product-page" id="coach">
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
            <p>Training Lab</p>
            <h1>练习工作台</h1>
          </div>

          <section className={`practice-brief ${currentScenario.id}`} aria-label="current scene">
            <img alt="" src={currentScenario.image} />
            <div>
              <span>{currentMode.label} · {targetLevel}</span>
              <strong>{currentScenario.title}</strong>
              <p>{currentMode.id === 'scenario' ? currentScenario.descriptionZh : currentMode.goal}</p>
            </div>
            <button onClick={() => openRoleDialog(currentScenario)} type="button">
              <MessageSquareText size={16} />
              打开角色陪练
            </button>
          </section>

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

          <section className="focus-board">
            <div className="mini-heading">
              <Sparkles size={16} />
              <span>Focus stack</span>
            </div>
            <div className="focus-chip-row">
              {currentScenario.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setGoal(`Practice ${skill} in ${currentSessionTitle}.`)}
                  type="button"
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="template-actions">
              <button onClick={() => loadDraftTemplate(currentScenario.sample)} type="button">
                Sample answer
              </button>
              <button
                disabled={feedback.suggestedRewrite === initialFeedback.suggestedRewrite}
                onClick={() => loadDraftTemplate(feedback.suggestedRewrite)}
                type="button"
              >
                Better version
              </button>
              <button onClick={() => loadDraftTemplate(feedback.nextPrompt)} type="button">
                Next prompt
              </button>
            </div>
          </section>

          <section className="sprint-card">
            <div className="mini-heading">
              <CheckCircle2 size={16} />
              <span>Readiness</span>
            </div>
            <strong>{draftReadinessScore}% ready</strong>
            <div className="readiness-meter" aria-hidden="true">
              <span style={{ width: `${draftReadinessScore}%` }} />
            </div>
            <ul>
              {draftReadinessItems.map((item) => (
                <li className={item.complete ? 'complete' : ''} key={`side-${item.label}`}>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
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

          <div className="message-list" ref={messageListRef} aria-live="polite">
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
            <div className="starter-phrases" aria-label="starter phrases">
              <span>Starter phrases</span>
              <div>
                {starterPhrases.map((phrase) => (
                  <button key={phrase} onClick={() => insertStarterPhrase(phrase)} type="button">
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              onChange={(event) => {
                setDraft(event.target.value)
                if (!isListening) {
                  latestTranscriptRef.current = event.target.value
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
            <div className={`voice-flow ${voiceFlowStatus}`} aria-live="polite">
              <div>
                <span>Voice flow</span>
                <strong>{voiceFlowState.label}</strong>
              </div>
              <small>{voiceFlowState.hint}</small>
            </div>
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
                <span>{isListening ? (autoSubmitVoice ? 'Stop & send' : 'Stop') : 'Speak'}</span>
              </button>
              <button
                className={`flow-toggle ${autoSubmitVoice ? 'active' : ''}`}
                onClick={() => setAutoSubmitVoice((currentValue) => !currentValue)}
                title="语音结束后自动提交"
                type="button"
              >
                <ArrowRight size={18} />
                <span>{autoSubmitVoice ? 'Auto-send' : 'Manual send'}</span>
              </button>
              <button
                className={`audio-button ${autoSpeak ? 'active' : ''}`}
                onClick={() => {
                  setAutoSpeak((currentValue) => !currentValue)
                  if (autoSpeak) {
                    cancelCoachVoice()
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
              <button
                className="primary-button"
                disabled={!canSubmit}
                onClick={() => void submitAnswer()}
                type="button"
              >
                {isSubmitting ? <Loader2 className="spin-icon" size={18} /> : <Send size={18} />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="feedback-panel" aria-label="feedback">
          <section className="feedback-hero-card">
            <div>
              <p>Live Insight</p>
              <h3>{currentSessionTitle}</h3>
              <span>{feedback.focusArea}</span>
            </div>
            <div className="hero-score-ring">
              <strong>{feedback.score || '--'}</strong>
              <span>{feedback.level}</span>
            </div>
          </section>

          <section className="signal-strip" aria-label="coach signals">
            <article>
              <span>Voice</span>
              <strong>{feedback.pronunciation.score || '--'}</strong>
              <small>{feedback.pronunciation.confidence}</small>
            </article>
            <article>
              <span>Model</span>
              <strong>{feedback.provider.source === 'model' ? 'Live' : 'Local'}</strong>
              <small>{feedback.provider.model}</small>
            </article>
            <article>
              <span>Latency</span>
              <strong>
                {feedback.metrics.responseLatencyMs === null
                  ? '--'
                  : `${Math.round(feedback.metrics.responseLatencyMs)}ms`}
              </strong>
              <small>{feedback.metrics.speakingPace}</small>
            </article>
            <article>
              <span>Turns</span>
              <strong>{practiceHistory.length}</strong>
              <small>recent rounds</small>
            </article>
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
              <span>Words</span>
              <strong>{feedback.metrics.wordCount}</strong>
            </article>
          </section>

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
      </section>

      <section className="feedback-story product-page" id="feedback">
        <div>
          <p>Feedback System</p>
          <h2>
            A speaking dashboard that feels
            <span> alive.</span>
          </h2>
          <strong>
            Every turn becomes a compact learning record: pronunciation signal, grammar correction, rewrite, vocabulary, and a follow-up prompt.
          </strong>
        </div>
        <div className="feedback-glass-grid">
          <article>
            <span>Fluency</span>
            <strong>{feedback.metrics.fluency || '--'}</strong>
          </article>
          <article>
            <span>Pronunciation</span>
            <strong>{feedback.pronunciation.score || '--'}</strong>
          </article>
          <article>
            <span>Grammar</span>
            <strong>{feedback.metrics.grammar || '--'}</strong>
          </article>
          <article>
            <span>Next prompt</span>
            <p>{feedback.nextPrompt}</p>
          </article>
        </div>
      </section>

      {activeRoleScenario ? (
        <section
          aria-labelledby="role-dialog-title"
          aria-modal="true"
          className="role-dialog-layer"
          role="dialog"
        >
          <div
            className={`role-dialog ${isRoleDialogDragging ? 'dragging' : ''}`}
            ref={roleDialogRef}
            style={{
              transform: `translate3d(${roleDialogOffset.x}px, ${roleDialogOffset.y}px, 0)`,
            }}
          >
            <aside className="role-profile-panel">
              <button className="role-close-button" onClick={closeRoleDialog} title="关闭角色陪练" type="button">
                <X size={18} />
              </button>
              <div
                className="role-profile-hero role-drag-handle"
                onDoubleClick={() => setRoleDialogOffset({ x: 0, y: 0 })}
                onPointerDown={startRoleDialogDrag}
              >
                <RoleAvatar scenario={activeRoleScenario} size="large" />
                <div>
                  <p>{activeRoleScenario.titleEn}</p>
                  <h3>{activeRoleScenario.characterName}</h3>
                  <span>{activeRoleScenario.characterRole}</span>
                </div>
              </div>
              <div className="role-profile-tags">
                <span>{activeRoleScenario.level}</span>
                <span>{activeRoleScenario.voiceStyle}</span>
              </div>
              <p className="role-personality">{activeRoleScenario.personality}</p>
              <section className="role-followups">
                <h4>Natural follow-ups</h4>
                <ul>
                  {activeRoleScenario.exampleFollowUps.map((followUp) => (
                    <li key={followUp}>{followUp}</li>
                  ))}
                </ul>
              </section>
            </aside>

            <section className="role-chat-panel">
              <header
                className="role-chat-header role-drag-handle"
                onDoubleClick={() => setRoleDialogOffset({ x: 0, y: 0 })}
                onPointerDown={startRoleDialogDrag}
              >
                <div>
                  <p>{activeRoleScenario.title}</p>
                  <h2 id="role-dialog-title">
                    {activeRoleScenario.characterName} - {activeRoleScenario.titleEn}
                  </h2>
                </div>
                <span>{activeRoleScenario.level}</span>
              </header>

              <div className="role-message-list" ref={roleMessageListRef} aria-live="polite">
                {roleMessages.map((message) => (
                  <article className={`role-message ${message.role}`} key={message.id}>
                    <span>{message.role === 'coach' ? activeRoleScenario.characterName : 'You'}</span>
                    <p>{message.text}</p>
                  </article>
                ))}
                {isRoleSubmitting ? (
                  <article className="role-message coach loading">
                    <span>{activeRoleScenario.characterName}</span>
                    <p>
                      <Loader2 className="spin-icon" size={16} />
                      Thinking of the next question
                    </p>
                  </article>
                ) : null}

                {isRoleEnded ? (
                  <section className="role-report">
                    <div>
                      <p>Practice Summary</p>
                      <h3>{activeRoleScenario.titleEn}</h3>
                    </div>
                    <div className="role-score-grid" aria-label="practice score">
                      <article>
                        <span>Fluency</span>
                        <strong>{formatTenPointScore(roleFeedback?.metrics.fluency, 7)}</strong>
                      </article>
                      <article>
                        <span>Grammar</span>
                        <strong>{formatTenPointScore(roleFeedback?.metrics.grammar, 6)}</strong>
                      </article>
                      <article>
                        <span>Vocabulary</span>
                        <strong>{formatTenPointScore(roleFeedback?.metrics.vocabulary, 7)}</strong>
                      </article>
                      <article>
                        <span>Naturalness</span>
                        <strong>{formatTenPointScore(roleFeedback?.metrics.interaction, 6)}</strong>
                      </article>
                      <article>
                        <span>Confidence</span>
                        <strong>{formatTenPointScore(roleFeedback?.score, 7)}</strong>
                      </article>
                    </div>
                    <section>
                      <h4>Main Problems</h4>
                      <ol>
                        {[
                          roleFeedback ? `本轮重点：${roleFeedback.focusArea}` : '',
                          ...activeRoleScenario.reportProblems,
                        ]
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((problem) => (
                            <li key={problem}>{problem}</li>
                          ))}
                      </ol>
                    </section>
                    <section>
                      <h4>Better Expressions</h4>
                      <ol>
                        {activeRoleScenario.betterExpressions.map((expression) => (
                          <li key={expression.lessNatural}>
                            <span>"{expression.lessNatural}"</span>
                            <strong>"{expression.natural}"</strong>
                          </li>
                        ))}
                        {roleFeedback?.suggestedRewrite ? (
                          <li>
                            <span>本轮可优化表达</span>
                            <strong>{roleFeedback.suggestedRewrite}</strong>
                          </li>
                        ) : null}
                      </ol>
                    </section>
                    <section>
                      <h4>Useful Sentences</h4>
                      <ol>
                        {activeRoleScenario.usefulSentences.map((sentence) => (
                          <li key={sentence}>{sentence}</li>
                        ))}
                      </ol>
                    </section>
                  </section>
                ) : null}
              </div>

              <form
                className="role-composer"
                onSubmit={(event) => {
                  event.preventDefault()
                  void submitRoleAnswer()
                }}
              >
                <textarea
                  disabled={isRoleEnded}
                  onChange={(event) => setRoleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault()
                      void submitRoleAnswer()
                    }
                  }}
                  placeholder={isRoleEnded ? 'Practice ended. Start a new scene to continue.' : activeRoleScenario.sample}
                  rows={3}
                  value={roleDraft}
                />
                <div className="role-actions">
                  <button
                    className={`role-voice-button ${isRoleListening ? 'listening' : ''}`}
                    disabled={!speechSupported || isRoleEnded}
                    onClick={toggleRoleListening}
                    title={speechSupported ? '语音输入' : '当前浏览器不支持语音输入'}
                    type="button"
                  >
                    {isRoleListening ? <MicOff size={17} /> : <Mic size={17} />}
                    <span>{isRoleListening ? 'Listening' : 'Speak'}</span>
                  </button>
                  <button
                    className={`role-audio-button ${roleAutoSpeak ? 'active' : ''} ${isRoleSpeaking ? 'speaking' : ''}`}
                    onClick={toggleRoleAutoSpeak}
                    title="自动朗读角色回复"
                    type="button"
                  >
                    {roleAutoSpeak ? <Volume2 size={17} /> : <VolumeX size={17} />}
                    <span>{isRoleSpeaking ? 'Speaking' : roleAutoSpeak ? 'Voice on' : 'Voice off'}</span>
                  </button>
                  <button className="role-send-button" disabled={!canSubmitRole} type="submit">
                    {isRoleSubmitting ? <Loader2 className="spin-icon" size={17} /> : <Send size={17} />}
                    <span>Send</span>
                  </button>
                  <button
                    className="role-secondary-button"
                    disabled={isRoleEnded}
                    onClick={finishRolePractice}
                    type="button"
                  >
                    <Flag size={17} />
                    <span>End practice</span>
                  </button>
                  <button className="role-secondary-button" onClick={finishRolePractice} type="button">
                    <FileText size={17} />
                    <span>View feedback</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      ) : null}

      <aside
        className={`study-companion ${companionOpen ? 'open' : 'minimized'} companion-${companionAction}`}
        aria-label="study companion"
      >
        <button
          className="companion-avatar"
          aria-label={companionOpen ? '收起学习精灵' : '打开学习精灵'}
          aria-pressed={companionOpen}
          onClick={toggleCompanion}
          title={companionOpen ? '收起学习精灵' : '打开学习精灵'}
          type="button"
        >
          <span className="companion-pulse" />
          <span className="companion-sparkle one" />
          <span className="companion-sparkle two" />
          <span className="companion-sparkle three" />
          <span className="companion-body">
            <span className="companion-ear left" />
            <span className="companion-ear right" />
            <span className="companion-arm left" />
            <span className="companion-arm right" />
            <span className="companion-face">
              <span className="companion-eye left" />
              <span className="companion-eye right" />
              <span className="companion-smile" />
            </span>
          </span>
        </button>

        {companionOpen ? (
          <section className="companion-panel">
            <div className="companion-heading">
              <div>
                <p>Study Buddy</p>
                <h3>今天一起记住一句</h3>
              </div>
              <span>{companionProgress}%</span>
            </div>

            <div className="companion-tabs" aria-label="companion mode">
              {companionTabs.map((tab) => {
                const TabIcon = tab.icon

                return (
                  <button
                    className={companionTab === tab.id ? 'active' : ''}
                    key={tab.id}
                    onClick={() => setCompanionTab(tab.id)}
                    type="button"
                  >
                    <TabIcon size={15} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {companionTab === 'memory' ? (
              <div className="companion-card memory">
                <span>Memory Card</span>
                <strong>{companionCard}</strong>
                <p>先小声读一遍，再换一个自己的例子说出来。</p>
                <div>
                  <button onClick={saveCompanionCard} type="button">
                    <Sparkles size={15} />
                    放进输入框
                  </button>
                  <button
                    onClick={() => setCompanionTipIndex((currentIndex) => currentIndex + 1)}
                    type="button"
                  >
                    下一张
                  </button>
                </div>
              </div>
            ) : null}

            {companionTab === 'review' ? (
              <div className="companion-card review">
                <span>Recall Loop</span>
                <strong>{currentScenario.title} · {targetLevel}</strong>
                <ul>
                  <li>
                    <CheckCircle2 size={14} />
                    复述刚才的短语，不看原句。
                  </li>
                  <li>
                    <CheckCircle2 size={14} />
                    加一个 because 或 for example。
                  </li>
                  <li>
                    <CheckCircle2 size={14} />
                    最后问教练一个追问。
                  </li>
                </ul>
                <button onClick={startRecallPractice} type="button">
                  开始复述
                </button>
              </div>
            ) : null}

            {companionTab === 'chat' ? (
              <div className="companion-card chat">
                <span>Coach Hint</span>
                <strong>{currentMode.title}</strong>
                <p>
                  当前建议：先保证完整句，再补一个细节。你的答案准备度是 {draftReadinessScore}%。
                </p>
                <button
                  onClick={() => document.getElementById('coach')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  type="button"
                >
                  <Target size={15} />
                  回到练习区
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </aside>

      <footer className="product-footer">
        <span>SpeakPilot</span>
        <a href="#product">Back to top</a>
      </footer>
    </main>
  )
}

function RoleAvatar({ scenario, size }: { scenario: Scenario; size: 'small' | 'large' }) {
  return (
    <div className={`role-avatar ${scenario.avatarClass} ${size}`} aria-hidden="true">
      <span className="avatar-hair" />
      <span className="avatar-face">
        <span className="avatar-eye left" />
        <span className="avatar-eye right" />
        <span className="avatar-mouth" />
      </span>
      <span className="avatar-neck" />
      <span className="avatar-outfit" />
      <span className="avatar-badge" />
    </div>
  )
}

function formatTenPointScore(value: number | undefined, fallback: number) {
  const score = typeof value === 'number' && value > 0 ? Math.round(value / 10) : fallback

  return `${Math.max(1, Math.min(10, score))}/10`
}

function clampDialogOffset(x: number, y: number, width: number, height: number): DialogOffset {
  const margin = 12
  const maxX = Math.max(0, (window.innerWidth - width) / 2 - margin)
  const maxY = Math.max(0, (window.innerHeight - height) / 2 - margin)

  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  }
}

function getRoleVoiceSettings(scenarioId: string) {
  const settings: Record<string, { lang: string; pitch: number; rate: number }> = {
    travel: {
      lang: 'en-GB',
      pitch: 1.08,
      rate: 0.84,
    },
    interview: {
      lang: 'en-US',
      pitch: 0.98,
      rate: 0.9,
    },
    daily: {
      lang: 'en-US',
      pitch: 1.18,
      rate: 0.9,
    },
    presentation: {
      lang: 'en-US',
      pitch: 1,
      rate: 0.88,
    },
  }

  return settings[scenarioId] ?? {
    lang: 'en-US',
    pitch: 1.08,
    rate: 0.9,
  }
}

function createRoleOpeningMessage(scenario: Scenario): Message {
  return {
    id: `role-${scenario.id}-opening`,
    role: 'coach',
    text: scenario.openingMessage,
  }
}

function createInitialMessages(mode: ModeConfig, scenario: Scenario): Message[] {
  return [
    {
      id: `${mode.id}-${scenario.id}-opening`,
      role: 'coach',
      text: mode.id === 'scenario' ? scenario.openingMessage : mode.opening,
    },
  ]
}

export default App
