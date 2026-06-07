import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { z } from 'zod'

dotenv.config({ quiet: true })

const app = express()
const port = Number(process.env.API_PORT ?? 8787)
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

app.use(
  cors({
    origin: clientOrigin,
  }),
)
app.use(express.json({ limit: '1mb' }))

const coachModeSchema = z.enum(['scenario', 'freeTalk', 'grammar', 'plan', 'vocabulary'])
const learnerLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1'])

const chatMessageSchema = z.object({
  role: z.enum(['coach', 'learner']),
  text: z.string().min(1).max(2400),
})

const speechMetricsSchema = z.object({
  inputMethod: z.enum(['text', 'voice']).default('text'),
  recognitionConfidence: z.number().min(0).max(1).nullable().default(null),
  startedAt: z.number().nullable().default(null),
  endedAt: z.number().nullable().default(null),
})

const coachRequestSchema = z.object({
  mode: coachModeSchema.default('scenario'),
  scenarioId: z.string().min(1).default('travel'),
  scenarioTitle: z.string().min(1).default('机场值机'),
  learnerText: z.string().min(1).max(5000),
  targetLevel: learnerLevelSchema.default('B1'),
  goal: z.string().max(800).default(''),
  roleName: z.string().max(80).default(''),
  rolePrompt: z.string().max(2400).default(''),
  history: z.array(chatMessageSchema).max(12).default([]),
  speech: speechMetricsSchema.default({
    inputMethod: 'text',
    recognitionConfidence: null,
    startedAt: null,
    endedAt: null,
  }),
})

const speakingFeedbackRequestSchema = z.object({
  scenarioId: z.string().min(1),
  scenarioTitle: z.string().min(1),
  learnerText: z.string().min(1).max(5000),
  history: z.array(chatMessageSchema).max(10).default([]),
})

const vocabularyItemSchema = z.object({
  phrase: z.string(),
  meaning: z.string(),
  example: z.string(),
})

const drillItemSchema = z.object({
  title: z.string(),
  prompt: z.string(),
})

const planItemSchema = z.object({
  day: z.string(),
  task: z.string(),
})

const correctionItemSchema = z.object({
  issue: z.string(),
  suggestion: z.string(),
  reason: z.string(),
})

const pronunciationSchema = z.object({
  score: z.number().int().min(0).max(100),
  confidence: z.string(),
  advice: z.string(),
})

const metricsSchema = z.object({
  fluency: z.number().int().min(0).max(100),
  pronunciation: z.number().int().min(0).max(100),
  grammar: z.number().int().min(0).max(100),
  vocabulary: z.number().int().min(0).max(100),
  interaction: z.number().int().min(0).max(100),
  responseLatencyMs: z.number().int().nullable(),
  speakingPace: z.string(),
  wordCount: z.number().int().min(0),
})

const sessionSummarySchema = z.object({
  headline: z.string(),
  nextStep: z.string(),
  homework: z.array(z.string()).min(1).max(4),
})

const coachOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  level: z.enum(['Needs practice', 'Developing', 'Clear', 'Confident']),
  focusArea: z.string(),
  strengths: z.array(z.string()).min(1).max(5),
  improvements: z.array(z.string()).min(1).max(5),
  suggestedRewrite: z.string(),
  coachReply: z.string(),
  nextPrompt: z.string(),
  vocabulary: z.array(vocabularyItemSchema).min(1).max(6),
  drills: z.array(drillItemSchema).min(1).max(5),
  studyPlan: z.array(planItemSchema).min(1).max(7),
  pronunciation: pronunciationSchema,
  metrics: metricsSchema,
  corrections: z.array(correctionItemSchema).min(1).max(5),
  sessionSummary: sessionSummarySchema,
})

type CoachMode = z.infer<typeof coachModeSchema>
type CoachRequest = z.infer<typeof coachRequestSchema>
type CoachOutput = z.infer<typeof coachOutputSchema>
type CoachResponse = CoachOutput & {
  provider: {
    source: 'model' | 'fallback'
    model: string
    label: string
    error?: string
  }
}

const scenarioVocabulary: Record<string, string[]> = {
  travel: ['reservation', 'boarding pass', 'luggage', 'aisle seat', 'departure'],
  interview: ['experience', 'strength', 'project', 'challenge', 'contribute'],
  daily: ['recommend', 'prefer', 'could I', 'would like', 'appreciate'],
  presentation: ['overview', 'evidence', 'impact', 'timeline', 'next step'],
}

const modeLabels: Record<CoachMode, string> = {
  scenario: 'Scenario role-play',
  freeTalk: 'Free conversation',
  grammar: 'Grammar and expression clinic',
  plan: 'Personal study plan',
  vocabulary: 'Vocabulary builder',
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'speakpilot-coach',
    ai: getPublicAiStatus(),
    time: new Date().toISOString(),
  })
})

app.get('/api/ai/status', (_request, response) => {
  response.json(getPublicAiStatus())
})

app.post('/api/coach/session', async (request, response) => {
  const parsed = coachRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const feedback = await createCoachResponse(parsed.data)
    response.json(feedback)
  } catch (error) {
    console.error(error)
    response.status(500).json({
      error: 'Unable to create coach response',
    })
  }
})

app.post('/api/speaking/feedback', async (request, response) => {
  const parsed = speakingFeedbackRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const feedback = await createCoachResponse({
      mode: 'scenario',
      scenarioId: parsed.data.scenarioId,
      scenarioTitle: parsed.data.scenarioTitle,
      learnerText: parsed.data.learnerText,
      targetLevel: 'B1',
      goal: '',
      roleName: '',
      rolePrompt: '',
      history: parsed.data.history,
      speech: {
        inputMethod: 'text',
        recognitionConfidence: null,
        startedAt: null,
        endedAt: null,
      },
    })
    response.json(feedback)
  } catch (error) {
    console.error(error)
    response.status(500).json({
      error: 'Unable to create speaking feedback',
    })
  }
})

app.post('/api/assistant', async (request, response) => {
  const parsed = coachRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten(),
    })
    return
  }

  const feedback = await createCoachResponse(parsed.data)
  response.json({
    topic: parsed.data.scenarioTitle,
    mode: parsed.data.mode,
    reply: feedback.coachReply,
    feedback,
  })
})

async function createCoachResponse(input: CoachRequest): Promise<CoachResponse> {
  const modelResult = await createModelCoachOutput(input)
  const aiConfig = getAiConfig()

  if (modelResult.output) {
    return {
      ...modelResult.output,
      provider: {
        source: 'model',
        model: aiConfig.model,
        label: getProviderLabel(aiConfig.baseUrl),
      },
    }
  }

  return {
    ...createFallbackCoachOutput(input),
    provider: {
      source: 'fallback',
      model: 'local-rule-coach',
      label: aiConfig.apiKey ? 'Model fallback' : 'Local fallback',
      error: modelResult.error,
    },
  }
}

async function createModelCoachOutput(input: CoachRequest) {
  const aiConfig = getAiConfig()

  if (!aiConfig.apiKey) {
    return {
      output: null,
    }
  }

  const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: aiConfig.model,
      temperature: 0.45,
      messages: [
        {
          role: 'system',
          content: createSystemPrompt(),
        },
        {
          role: 'user',
          content: JSON.stringify({
            mode: input.mode,
            modeLabel: modeLabels[input.mode],
            targetLevel: input.targetLevel,
            userGoal: input.goal,
            scenario: input.scenarioTitle,
            roleName: input.roleName,
            rolePrompt: input.rolePrompt,
            learnerText: input.learnerText,
            recentHistory: input.history,
            speechMetrics: input.speech,
          }),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Model request failed: ${response.status} ${errorText}`)
    return {
      output: null,
      error: summarizeProviderError(response.status, errorText),
    }
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    return {
      output: null,
      error: 'Model returned an empty response.',
    }
  }

  const output = parseCoachOutput(content)

  return {
    output,
    error: output ? undefined : 'Model response could not be parsed as coach feedback JSON.',
  }
}

function createSystemPrompt() {
  return [
    'You are SpeakPilot, a model-backed English speaking coach for Chinese learners.',
    'Coach beyond scripted role-play: support free conversation, grammar diagnosis, vocabulary building, study planning, and scenario practice.',
    'If rolePrompt is provided, treat it as the active role-play instruction. Stay in that named character for coachReply and ask one natural follow-up question at a time.',
    'Be encouraging, specific, and practical. Keep explanations concise enough for an app UI.',
    'Return only valid JSON. Do not wrap JSON in markdown.',
    'The JSON must match this TypeScript shape:',
    '{ score: number; level: "Needs practice" | "Developing" | "Clear" | "Confident"; focusArea: string; strengths: string[]; improvements: string[]; suggestedRewrite: string; coachReply: string; nextPrompt: string; vocabulary: { phrase: string; meaning: string; example: string }[]; drills: { title: string; prompt: string }[]; studyPlan: { day: string; task: string }[]; pronunciation: { score: number; confidence: string; advice: string }; metrics: { fluency: number; pronunciation: number; grammar: number; vocabulary: number; interaction: number; responseLatencyMs: number | null; speakingPace: string; wordCount: number }; corrections: { issue: string; suggestion: string; reason: string }[]; sessionSummary: { headline: string; nextStep: string; homework: string[] } }',
    'Use English for learner-facing practice content. Use short Chinese explanations only when clarifying why something is wrong or how to improve.',
    'Treat browser speech-recognition confidence as a pronunciation signal, not a perfect pronunciation score.',
    'Give quantifiable feedback across fluency, pronunciation, grammar, vocabulary, and interaction.',
    'Include at least one correction and one concrete post-class homework item.',
    'For grammar mode, identify expression issues and provide a natural rewrite.',
    'For plan mode, create a practical micro-plan tied to the learner goal.',
    'For vocabulary mode, recommend phrases that can be used immediately in speech.',
  ].join('\n')
}

function parseCoachOutput(content: string) {
  const jsonBlock = content.match(/\{[\s\S]*\}/)?.[0]

  if (!jsonBlock) {
    return null
  }

  try {
    return coachOutputSchema.parse(JSON.parse(jsonBlock))
  } catch (error) {
    console.error('Unable to parse model output', error)
    return null
  }
}

function summarizeProviderError(status: number, errorText: string) {
  if (status === 401) {
    return 'Provider authentication failed. Check the API key in .env.'
  }

  if (status === 402 || errorText.toLowerCase().includes('balance')) {
    return 'Provider billing or balance check failed.'
  }

  if (status === 429) {
    return 'Provider rate limit reached. Try again later.'
  }

  return `Provider request failed with HTTP ${status}.`
}

function createFallbackCoachOutput(input: CoachRequest): CoachOutput {
  const cleanedText = normalizeText(input.learnerText)
  const lowerText = cleanedText.toLowerCase()
  const words = lowerText.match(/[a-z']+/g) ?? []
  const uniqueWords = new Set(words)
  const targetVocabulary = scenarioVocabulary[input.scenarioId] ?? []
  const usedTargetVocabulary = targetVocabulary.filter((word) =>
    lowerText.includes(word.toLowerCase()),
  )
  const fillerCount = countFillers(words)
  const hasQuestion = cleanedText.includes('?')
  const hasPolitePhrase = /\b(could|would|please|thank|appreciate)\b/i.test(cleanedText)
  const sentenceCount = Math.max(1, cleanedText.split(/[.!?]+/).filter(Boolean).length)

  const score = clampScore(
    46 +
      Math.min(words.length, 48) +
      Math.min(uniqueWords.size, 32) * 0.35 +
      usedTargetVocabulary.length * 5 +
      sentenceCount * 3 +
      (hasQuestion ? 4 : 0) +
      (hasPolitePhrase ? 5 : 0) -
      fillerCount * 4,
  )
  const pronunciation = createPronunciation(input, words.length)
  const metrics = createMetrics(input, score, pronunciation.score, words.length, uniqueWords.size)

  return {
    score,
    level: getLevel(score),
    focusArea: getFocusArea(input.mode, input.scenarioId, words.length, fillerCount),
    strengths: createStrengths(words.length, uniqueWords.size, usedTargetVocabulary),
    improvements: createImprovements(input.mode, input.scenarioId, words.length, fillerCount),
    suggestedRewrite: createRewrite(input.mode, input.scenarioId, cleanedText),
    coachReply: createCoachReply(input, cleanedText),
    nextPrompt: createNextPrompt(input.mode, input.scenarioId, input.goal),
    vocabulary: createVocabulary(input.mode, input.scenarioId, usedTargetVocabulary),
    drills: createDrills(input.mode, input.scenarioId, input.targetLevel),
    studyPlan: createStudyPlan(input.mode, input.goal, input.targetLevel),
    pronunciation,
    metrics,
    corrections: createCorrections(input.mode, cleanedText),
    sessionSummary: createSessionSummary(input.mode, score, getFocusArea(input.mode, input.scenarioId, words.length, fillerCount)),
  }
}

function getAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || ''
  const baseUrl = (
    process.env.OPENAI_BASE_URL ||
    process.env.LLM_BASE_URL ||
    'https://api.openai.com/v1'
  ).replace(/\/$/, '')
  const model = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'chat-latest'

  return {
    apiKey,
    baseUrl,
    model,
  }
}

function getPublicAiStatus() {
  const aiConfig = getAiConfig()

  return {
    configured: Boolean(aiConfig.apiKey),
    model: aiConfig.model,
    provider: getProviderLabel(aiConfig.baseUrl),
    source: aiConfig.apiKey ? 'model' : 'fallback',
  }
}

function getProviderLabel(baseUrl: string) {
  return baseUrl.includes('api.openai.com') ? 'OpenAI-compatible' : 'Custom model endpoint'
}

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

function countFillers(words: string[]) {
  return words.reduce((count, word, index) => {
    if (['um', 'uh', 'actually', 'basically'].includes(word)) {
      return count + 1
    }

    if (word === 'like' && words[index - 1] !== 'would') {
      return count + 1
    }

    return count
  }, 0)
}

function clampScore(score: number) {
  return Math.max(35, Math.min(98, Math.round(score)))
}

function getLevel(score: number): CoachOutput['level'] {
  if (score >= 86) return 'Confident'
  if (score >= 72) return 'Clear'
  if (score >= 55) return 'Developing'
  return 'Needs practice'
}

function getFocusArea(mode: CoachMode, scenarioId: string, wordCount: number, fillerCount: number) {
  if (mode === 'grammar') return 'Accuracy and natural phrasing'
  if (mode === 'plan') return 'Personal learning route'
  if (mode === 'vocabulary') return 'Reusable speaking phrases'
  if (fillerCount > 0) return 'Fluency and pausing'
  if (wordCount < 12) return 'Longer answers'
  if (scenarioId === 'interview') return 'Concrete examples'
  if (scenarioId === 'presentation') return 'Clear structure'
  return 'Natural follow-up questions'
}

function createStrengths(wordCount: number, uniqueWordCount: number, usedTargetVocabulary: string[]) {
  const strengths = [
    wordCount >= 12
      ? 'You gave enough detail for the coach to respond naturally.'
      : 'You started the conversation clearly.',
    uniqueWordCount >= 10
      ? 'Your vocabulary range is strong for this turn.'
      : 'Your meaning is easy to understand.',
  ]

  if (usedTargetVocabulary.length > 0) {
    strengths.push(`Good scenario vocabulary: ${usedTargetVocabulary.join(', ')}.`)
  }

  return strengths
}

function createImprovements(
  mode: CoachMode,
  scenarioId: string,
  wordCount: number,
  fillerCount: number,
) {
  if (mode === 'grammar') {
    return [
      'Use one clear tense for the main action.',
      'Replace direct translation with a shorter natural phrase.',
    ]
  }

  if (mode === 'plan') {
    return [
      'Turn your goal into one measurable weekly speaking task.',
      'Record short answers so progress can be compared over time.',
    ]
  }

  if (mode === 'vocabulary') {
    return [
      'Choose two phrases and reuse them in a new answer.',
      'Say each phrase inside a full sentence, not alone.',
    ]
  }

  const improvements = [
    wordCount < 12
      ? 'Add one more detail so the answer sounds less memorized.'
      : 'Connect your ideas with one linking phrase such as "because", "also", or "for example".',
    fillerCount > 0
      ? 'Reduce filler words and pause silently when you need time.'
      : 'Try adding a natural follow-up question to keep the conversation moving.',
  ]

  if (['travel', 'daily'].includes(scenarioId)) {
    improvements.push('Use a polite phrase such as "Could I..." or "Would it be possible..."')
  }

  return improvements
}

function createRewrite(mode: CoachMode, scenarioId: string, text: string) {
  if (mode === 'plan') {
    return 'My goal is to improve spoken English with short daily practice, weekly review, and focused feedback on fluency and accuracy.'
  }

  if (mode === 'vocabulary') {
    return 'I want to learn practical phrases that I can use naturally in real conversations, not just memorize as a list.'
  }

  const polishedText = text
    .replace(/\bI very like\b/g, 'I really like')
    .replace(/\bi very like\b/g, 'I really like')
    .replace(/\bhelp me speaking\b/gi, 'help me speak')
    .replace(/\bi\b/g, 'I')
    .replace(/\bim\b/gi, "I'm")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bwanna\b/gi, 'want to')
    .replace(/\bgonna\b/gi, 'going to')

  const ending = /[.!?]$/.test(polishedText) ? polishedText : `${polishedText}.`
  const fallbackByScenario: Record<string, string> = {
    travel:
      'Could you please help me check in? I have a reservation, and I would like to confirm my luggage allowance.',
    interview:
      'In my last project, I worked on a clear problem, took responsibility for one part, and helped the team improve the result.',
    daily:
      'I would like to order a coffee, and could you recommend something that is not too sweet?',
    presentation:
      'Today I will give a brief overview of the problem, the solution, and the expected impact.',
  }

  if (ending.split(' ').length < 6) {
    return fallbackByScenario[scenarioId] ?? 'Could you say that again with one more detail?'
  }

  return ending
}

function createCoachReply(input: CoachRequest, text: string) {
  const { goal, mode, roleName, scenarioId } = input

  if (mode === 'scenario' && roleName) {
    return createCharacterReply(input)
  }

  if (mode === 'freeTalk' && text.split(' ').length < 4) {
    return createShortFreeTalkReply(text)
  }

  if (text.split(' ').length < 4) {
    return 'Nice start. Please answer in a full sentence so we can practice a more natural conversation.'
  }

  if (mode === 'freeTalk') {
    return 'Good. I can continue this naturally. Tell me one reason behind your answer, then ask me a related question.'
  }

  if (mode === 'grammar') {
    return 'Your meaning is understandable. Now try the improved version once, then make a new sentence with the same pattern.'
  }

  if (mode === 'plan') {
    return `Your goal is clear${goal ? `: ${goal}` : ''}. Let us turn it into small speaking tasks you can repeat this week.`
  }

  if (mode === 'vocabulary') {
    return 'Pick two of these phrases and use them in a new answer. I will check whether they sound natural.'
  }

  const replies: Record<string, string> = {
    travel: 'Great. I can help with that. For this trip, do you prefer a window seat or an aisle seat?',
    interview:
      'Thanks for sharing that. Can you give me one specific example and explain what impact it had?',
    daily:
      'That sounds good. Would you like me to recommend something popular, or do you have a flavor in mind?',
    presentation: 'Good opening. What is the most important result you want your audience to remember?',
  }

  return replies[scenarioId] ?? 'Good answer. Can you add one more detail and ask me a follow-up question?'
}

function createCharacterReply(input: CoachRequest) {
  const turnCount = input.history.filter((message) => message.role === 'learner').length
  const normalizedText = input.learnerText.toLowerCase()

  if (normalizedText.split(/\s+/).filter(Boolean).length < 4) {
    const shortReplies: Record<string, string> = {
      travel:
        'No problem. Try a full sentence: "I would like to check in, please." May I see your passport and booking reference?',
      interview:
        'That is a start. Please give me a fuller self-introduction with your study background and one relevant experience.',
      daily:
        'Sure. Try: "Can I have a latte, please?" What drink would you like today?',
      presentation:
        'Please give me a fuller opening. Start with the problem your project is trying to solve.',
    }

    return shortReplies[input.scenarioId] ?? 'Please answer in one full sentence so we can continue naturally.'
  }

  const repliesByScenario: Record<string, string[]> = {
    travel: [
      'Thank you. Are you checking in any bags today?',
      'Great. Would you prefer a window seat or an aisle seat?',
      'Your boarding gate is B12, and boarding starts at 10:35. Do you have any questions about your flight?',
      'All set. Please keep your passport and boarding pass ready for security.',
    ],
    interview: [
      'Thanks for the introduction. Could you tell me more about one project or experience that is most relevant to this role?',
      'What was your specific role in the team, and what result did you achieve?',
      'Why are you interested in this position?',
      'What would you say is your biggest strength? Please give me one example.',
    ],
    daily: [
      'Sounds good. Would you like that hot or iced?',
      'What size would you like, and would you prefer regular milk, oat milk, or soy milk?',
      'Is that for here or to go?',
      'Great, that will be 4 pounds 20. Anything else today?',
    ],
    presentation: [
      'Thank you. What problem are you trying to solve?',
      'Who is your target user, and why do they need this solution?',
      'How is your solution different from existing products?',
      'What is your next milestone after this demo?',
    ],
  }
  const replies = repliesByScenario[input.scenarioId] ?? [
    'Good answer. Can you add one specific detail so the conversation feels more natural?',
  ]

  return replies[Math.min(Math.max(turnCount - 1, 0), replies.length - 1)]
}

function createShortFreeTalkReply(text: string) {
  const normalizedText = text.toLowerCase()

  if (normalizedText.includes('morning')) {
    return 'Good morning! Try a fuller answer: "Good morning, I feel ready to practice English today." What are you doing this morning?'
  }

  if (normalizedText.includes('bread')) {
    return 'Bread is a fine topic. Try saying: "I had bread for breakfast, and I liked it because it was warm." What did you eat with it?'
  }

  return `Good start with "${text}". Now make it a full sentence and add one reason.`
}

function createNextPrompt(mode: CoachMode, scenarioId: string, goal: string) {
  if (mode === 'freeTalk') return 'Continue with a full answer and one follow-up question.'
  if (mode === 'grammar') return 'Rewrite your answer using the better version, then say it again.'
  if (mode === 'plan') return `Choose one task from the plan and write a 30-second answer${goal ? ` about ${goal}` : ''}.`
  if (mode === 'vocabulary') return 'Use two recommended phrases in one short spoken answer.'

  const nextPrompts: Record<string, string> = {
    travel: 'Ask one follow-up question about your seat, luggage, or boarding time.',
    interview: 'Add one concrete example from your experience and explain the result.',
    daily: 'Continue the conversation by asking for a recommendation or giving a preference.',
    presentation: 'Summarize your main point in one sentence, then add a supporting detail.',
  }

  return nextPrompts[scenarioId] ?? 'Answer again with one extra detail.'
}

function createVocabulary(
  mode: CoachMode,
  scenarioId: string,
  usedTargetVocabulary: string[],
): CoachOutput['vocabulary'] {
  const scenarioPhrases: Record<string, CoachOutput['vocabulary']> = {
    travel: [
      {
        phrase: 'Could you please check...',
        meaning: '礼貌地请对方确认信息',
        example: 'Could you please check whether my luggage is included?',
      },
      {
        phrase: 'Would it be possible to...',
        meaning: '礼貌地提出请求',
        example: 'Would it be possible to change to an aisle seat?',
      },
    ],
    interview: [
      {
        phrase: 'One project I am proud of is...',
        meaning: '自然引出经历',
        example: 'One project I am proud of is a dashboard I built for user feedback.',
      },
      {
        phrase: 'The result was...',
        meaning: '说明影响或结果',
        example: 'The result was that the team could make decisions faster.',
      },
    ],
    daily: [
      {
        phrase: 'Could you recommend...',
        meaning: '请求推荐',
        example: 'Could you recommend something that is not too sweet?',
      },
      {
        phrase: 'I would prefer...',
        meaning: '表达偏好',
        example: 'I would prefer something warm and not too strong.',
      },
    ],
    presentation: [
      {
        phrase: 'The key problem is...',
        meaning: '引出核心问题',
        example: 'The key problem is that learners rarely get instant speaking feedback.',
      },
      {
        phrase: 'Our next step is...',
        meaning: '说明下一步',
        example: 'Our next step is to connect live model feedback and record progress.',
      },
    ],
  }

  if (mode === 'vocabulary') {
    return [
      {
        phrase: 'What I mean is...',
        meaning: '换一种方式解释观点',
        example: 'What I mean is that I need more practice with real conversations.',
      },
      {
        phrase: 'From my point of view...',
        meaning: '自然表达观点',
        example: 'From my point of view, speaking every day is more useful than memorizing lists.',
      },
      {
        phrase: 'It depends on...',
        meaning: '表达条件或不同情况',
        example: 'It depends on how much time I have after class.',
      },
    ]
  }

  const base = scenarioPhrases[scenarioId] ?? scenarioPhrases.daily

  if (usedTargetVocabulary.length > 0) {
    return [
      ...base,
      {
        phrase: usedTargetVocabulary[0],
        meaning: '你这轮已经用到的关键词',
        example: `Try to reuse "${usedTargetVocabulary[0]}" in your next answer.`,
      },
    ].slice(0, 3)
  }

  return base
}

function createDrills(
  mode: CoachMode,
  scenarioId: string,
  targetLevel: CoachRequest['targetLevel'],
): CoachOutput['drills'] {
  if (mode === 'grammar') {
    return [
      {
        title: 'Pattern repeat',
        prompt: 'Say the improved sentence twice, then replace one noun and say it again.',
      },
      {
        title: 'Tense check',
        prompt: 'Make one past-tense sentence and one present-tense sentence about the same topic.',
      },
    ]
  }

  if (mode === 'plan') {
    return [
      {
        title: '30-second answer',
        prompt: `Record a ${targetLevel} level answer today and compare it with tomorrow's version.`,
      },
      {
        title: 'One correction loop',
        prompt: 'Choose one sentence, improve it, and say it again without reading.',
      },
    ]
  }

  const topic = scenarioId === 'interview' ? 'work experience' : 'today topic'

  return [
    {
      title: 'Add one detail',
      prompt: `Answer again and add one detail about ${topic}.`,
    },
    {
      title: 'Ask back',
      prompt: 'Finish your answer with one natural follow-up question.',
    },
  ]
}

function createStudyPlan(
  mode: CoachMode,
  goal: string,
  targetLevel: CoachRequest['targetLevel'],
): CoachOutput['studyPlan'] {
  const goalText = goal || 'daily speaking confidence'

  if (mode === 'plan') {
    return [
      {
        day: 'Day 1',
        task: `Record a 45-second ${targetLevel} answer about ${goalText}.`,
      },
      {
        day: 'Day 2',
        task: 'Review the rewrite, repeat it three times, then answer without reading.',
      },
      {
        day: 'Day 3',
        task: 'Use three new phrases in a fresh answer and compare fluency.',
      },
      {
        day: 'Day 4',
        task: 'Do one free-talk round and ask the coach two follow-up questions.',
      },
    ]
  }

  return [
    {
      day: 'Today',
      task: 'Repeat the better version aloud and record one improved answer.',
    },
    {
      day: 'Next',
      task: 'Reuse one phrase and one correction in a new prompt.',
    },
  ]
}

function createPronunciation(input: CoachRequest, wordCount: number): CoachOutput['pronunciation'] {
  if (input.speech.inputMethod !== 'voice') {
    return {
      score: 72,
      confidence: 'Text input',
      advice: 'Use the Speak button to get pronunciation feedback from browser speech recognition.',
    }
  }

  const confidence = input.speech.recognitionConfidence
  const score = confidence === null ? 76 : clampScore(confidence * 100)

  return {
    score,
    confidence: confidence === null ? 'No confidence signal' : `${Math.round(confidence * 100)}% recognition confidence`,
    advice:
      score >= 85 || wordCount < 4
        ? 'Your words were recognized clearly. Keep the same pace and finish with a clear final consonant.'
        : 'Slow down slightly and separate key words. Repeat the better version once after listening to the coach.',
  }
}

function createMetrics(
  input: CoachRequest,
  score: number,
  pronunciationScore: number,
  wordCount: number,
  uniqueWordCount: number,
): CoachOutput['metrics'] {
  const durationMs =
    input.speech.startedAt && input.speech.endedAt
      ? Math.max(0, input.speech.endedAt - input.speech.startedAt)
      : null
  const minutes = durationMs ? durationMs / 60000 : null
  const wordsPerMinute = minutes && minutes > 0 ? Math.round(wordCount / minutes) : null
  const paceScore =
    wordsPerMinute === null
      ? 72
      : clampScore(100 - Math.abs(wordsPerMinute - 115) * 0.5)

  return {
    fluency: clampScore((score + paceScore) / 2),
    pronunciation: pronunciationScore,
    grammar: input.mode === 'grammar' ? clampScore(score - 2) : clampScore(score - 4),
    vocabulary: clampScore(55 + Math.min(uniqueWordCount, 35)),
    interaction: clampScore(score + (input.learnerText.includes('?') ? 5 : -4)),
    responseLatencyMs: null,
    speakingPace: wordsPerMinute === null ? 'Text input' : `${wordsPerMinute} wpm`,
    wordCount,
  }
}

function createCorrections(mode: CoachMode, text: string): CoachOutput['corrections'] {
  const lowerText = text.toLowerCase()
  const corrections: CoachOutput['corrections'] = []

  if (/\bi very like\b/i.test(text)) {
    corrections.push({
      issue: 'I very like',
      suggestion: 'I really like',
      reason: 'English uses an adverb such as "really" before "like".',
    })
  }

  if (/\bhelp me speaking\b/i.test(text)) {
    corrections.push({
      issue: 'help me speaking',
      suggestion: 'help me speak',
      reason: 'After "help someone", use the base verb.',
    })
  }

  if (/\bdont\b/i.test(text)) {
    corrections.push({
      issue: 'dont',
      suggestion: "don't",
      reason: 'Use the apostrophe in the contraction.',
    })
  }

  if (/\bi\b/.test(text)) {
    corrections.push({
      issue: 'lowercase i',
      suggestion: 'I',
      reason: 'The pronoun "I" is always capitalized.',
    })
  }

  if (mode === 'grammar' && corrections.length === 0) {
    corrections.push({
      issue: 'Expression polish',
      suggestion: 'Make the sentence shorter and more direct.',
      reason: 'Natural spoken English often uses fewer words than translated Chinese sentences.',
    })
  }

  if (corrections.length === 0 && lowerText.split(' ').length < 8) {
    corrections.push({
      issue: 'Short answer',
      suggestion: 'Add one reason or example.',
      reason: 'A longer answer gives the coach enough context to assess fluency and accuracy.',
    })
  }

  if (corrections.length === 0) {
    corrections.push({
      issue: 'Next-level phrasing',
      suggestion: 'Add a linking phrase such as "for example" or "because".',
      reason: 'Linking phrases make your answer sound more fluent and structured.',
    })
  }

  return corrections.slice(0, 4)
}

function createSessionSummary(
  mode: CoachMode,
  score: number,
  focusArea: string,
): CoachOutput['sessionSummary'] {
  return {
    headline: `${modeLabels[mode]} turn completed with ${score}/100.`,
    nextStep: `Next focus: ${focusArea}.`,
    homework: [
      'Repeat the better version aloud twice.',
      'Record one new answer using one recommended phrase.',
      'Send the new answer back to compare your score.',
    ],
  }
}

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
