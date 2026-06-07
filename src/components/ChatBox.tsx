import { CheckCircle2, Loader2, Mic, Send, Square, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialFeedback } from '../data/content'
import type { ChatMessage, CoachFeedback, LearnerLevel, PracticeMode, Scenario, SpeechMetrics, SpeechRecognitionLike } from '../types'
import { Button } from './Button'

type ChatBoxProps = {
  mode: PracticeMode
  title: string
  subtitle: string
  openingMessage: string
  placeholder: string
  scenario?: Scenario
  roleName?: string
  rolePrompt?: string
  targetLevel: LearnerLevel
  onFeedbackChange: (feedback: CoachFeedback) => void
  onTurnsChange: (turns: number) => void
  onVoiceChange: (enabled: boolean) => void
}

const emptySpeech: SpeechMetrics = {
  inputMethod: 'text',
  recognitionConfidence: null,
  startedAt: null,
  endedAt: null,
}

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
  'google us english',
  'google uk english female',
]

export function ChatBox({
  mode,
  title,
  subtitle,
  openingMessage,
  placeholder,
  scenario,
  roleName,
  rolePrompt,
  targetLevel,
  onFeedbackChange,
  onTurnsChange,
  onVoiceChange,
}: ChatBoxProps) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createCoachMessage(openingMessage)])
  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const [speechMetrics, setSpeechMetrics] = useState<SpeechMetrics>(emptySpeech)
  const [lastFeedback, setLastFeedback] = useState<CoachFeedback>(initialFeedback)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const transcriptRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const starterPhrases = useMemo(() => getStarterPhrases(mode, scenario?.id), [mode, scenario?.id])
  const voiceOptions = useMemo(() => sortVoiceOptions(voices), [voices])
  const selectedCoachVoice = useMemo(
    () => pickCoachVoice(voices, selectedVoiceURI),
    [selectedVoiceURI, voices],
  )
  const learnerTurns = messages.filter((message) => message.role === 'learner').length

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return undefined
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en')))
    }

    const timer = window.setTimeout(loadVoices, 0)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.clearTimeout(timer)
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    onTurnsChange(learnerTurns)
  }, [learnerTurns, onTurnsChange])

  useEffect(() => {
    onVoiceChange(voiceEnabled)
  }, [voiceEnabled, onVoiceChange])

  async function submitAnswer(answer = draft.trim(), metrics = speechMetrics) {
    const learnerText = answer.trim()

    if (!learnerText || isSubmitting) {
      return
    }

    const learnerMessage: ChatMessage = {
      id: makeId(),
      role: 'learner',
      text: learnerText,
    }
    const nextMessages = [...messages, learnerMessage]

    setMessages(nextMessages)
    setDraft('')
    transcriptRef.current = ''
    setIsSubmitting(true)

    try {
      const startedAt = getNowMs()
      const response = await fetch('/api/coach/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          scenarioId: scenario?.apiId ?? scenario?.id ?? 'free-talk',
          scenarioTitle: scenario?.titleZh ?? title,
          learnerText,
          targetLevel,
          goal: subtitle,
          roleName: roleName ?? scenario?.characterName ?? '',
          rolePrompt: rolePrompt ?? scenario?.systemPrompt ?? '',
          speech: metrics,
          history: nextMessages.slice(-10).map(({ role, text }) => ({ role, text })),
        }),
      })

      if (!response.ok) {
        throw new Error('Feedback request failed')
      }

      const feedback = (await response.json()) as CoachFeedback
      const enrichedFeedback: CoachFeedback = {
        ...feedback,
        metrics: {
          ...feedback.metrics,
          responseLatencyMs: getNowMs() - startedAt,
        },
      }
      const coachMessage: ChatMessage = {
        id: makeId(),
        role: 'coach',
        text: enrichedFeedback.coachReply,
      }

      setLastFeedback(enrichedFeedback)
      onFeedbackChange(enrichedFeedback)
      setMessages((currentMessages) => [...currentMessages, coachMessage])

      if (voiceEnabled) {
        speak(enrichedFeedback.coachReply)
      }
    } catch {
      const coachMessage: ChatMessage = {
        id: makeId(),
        role: 'coach',
        text: 'I cannot reach the coach service right now. Please check the local API and try again.',
      }

      setMessages((currentMessages) => [...currentMessages, coachMessage])
    } finally {
      setIsSubmitting(false)
      setSpeechMetrics(emptySpeech)
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!Recognition) {
      setDraft((currentDraft) =>
        currentDraft || 'Speech recognition is not available in this browser. Please type your answer.',
      )
      return
    }

    const recognition = new Recognition()
    const startedAt = getNowMs()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    transcriptRef.current = draft.trim()
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

      for (let index = 0; index < event.results.length; index += 1) {
        const alternative = event.results[index][0]
        transcript += `${alternative.transcript} `
        if (typeof alternative.confidence === 'number') {
          confidenceTotal += alternative.confidence
          confidenceCount += 1
        }
      }

      const cleanTranscript = transcript.replace(/\s+/g, ' ').trim()
      transcriptRef.current = cleanTranscript
      setDraft(cleanTranscript)
      setSpeechMetrics((currentMetrics) => ({
        ...currentMetrics,
        recognitionConfidence:
          confidenceCount > 0 ? confidenceTotal / confidenceCount : currentMetrics.recognitionConfidence,
      }))
    }
    recognition.onerror = () => {
      recognitionRef.current = null
      setIsListening(false)
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
      setSpeechMetrics((currentMetrics) => ({
        ...currentMetrics,
        inputMethod: 'voice',
        endedAt: currentMetrics.endedAt ?? getNowMs(),
      }))
    }

    try {
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } catch {
      recognitionRef.current = null
      setIsListening(false)
    }
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.voice = selectedCoachVoice ?? null
    utterance.rate = 0.9
    utterance.pitch = scenario?.id === 'coffee-order' ? 1.16 : 1.08
    utterance.volume = 0.96
    window.speechSynthesis.speak(utterance)
  }

  function finishPractice() {
    navigate('/session-result', {
      state: {
        feedback: lastFeedback,
        title,
        turns: learnerTurns,
      },
    })
  }

  return (
    <section className="chat-box">
      <header className="chat-header">
        <div>
          <p>{scenario ? scenario.titleEn : 'Practice Coach'}</p>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        {scenario ? (
          <div className="role-chip">
            <strong>{scenario.characterName}</strong>
            <span>{scenario.characterRole}</span>
          </div>
        ) : null}
      </header>

      <div className="chat-messages" aria-live="polite">
        {messages.map((message) => (
          <article className={`message ${message.role}`} key={message.id}>
            <span>{message.role === 'coach' ? roleName ?? scenario?.characterName ?? 'Coach' : 'You'}</span>
            <p>{message.text}</p>
          </article>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="starter-row">
        {starterPhrases.map((phrase) => (
          <button key={phrase} onClick={() => setDraft(phrase)} type="button">
            {phrase}
          </button>
        ))}
      </div>

      <div className="composer">
        <textarea
          aria-label="Practice answer"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          value={draft}
        />
        <div className="voice-picker">
          <label>
            <span>Voice type</span>
            <select
              aria-label="Choose coach voice"
              disabled={voiceOptions.length === 0}
              onChange={(event) => setSelectedVoiceURI(event.target.value === 'auto' ? '' : event.target.value)}
              value={selectedVoiceURI || 'auto'}
            >
              <option value="auto">Sweet auto · {selectedCoachVoice?.name ?? 'System voice'}</option>
              {voiceOptions.slice(0, 14).map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} · {voice.lang}
                </option>
              ))}
            </select>
          </label>
          <small>{selectedCoachVoice ? `${selectedCoachVoice.lang} · soft coach playback` : 'Browser voice list loading'}</small>
        </div>
        <div className="composer-actions">
          <Button icon={isListening ? <Square size={18} /> : <Mic size={18} />} onClick={toggleListening} variant="secondary">
            {isListening ? 'Stop' : 'Speak'}
          </Button>
          <Button
            icon={voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            onClick={() => setVoiceEnabled((currentValue) => !currentValue)}
            variant="ghost"
          >
            {voiceEnabled ? 'Voice on' : 'Voice off'}
          </Button>
          <Button disabled={isSubmitting || !draft.trim()} icon={isSubmitting ? <Loader2 size={18} /> : <Send size={18} />} onClick={() => void submitAnswer()} variant="primary">
            Send
          </Button>
          <Button icon={<CheckCircle2 size={18} />} onClick={finishPractice} variant="secondary">
            End Practice
          </Button>
        </div>
      </div>
    </section>
  )
}

function getSweetVoiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (lang.startsWith('en-us')) score += 40
  else if (lang.startsWith('en-gb')) score += 34
  else if (lang.startsWith('en')) score += 24

  preferredVoiceNames.forEach((preferredName, index) => {
    if (name.includes(preferredName)) {
      score += 90 - index * 3
    }
  })

  if (name.includes('female')) score += 16
  if (name.includes('natural')) score += 12
  if (name.includes('premium')) score += 10
  if (name.includes('compact')) score -= 14
  if (name.includes('male')) score -= 20

  return score
}

function sortVoiceOptions(voices: SpeechSynthesisVoice[]) {
  return [...voices].sort((a, b) => getSweetVoiceScore(b) - getSweetVoiceScore(a))
}

function pickCoachVoice(voices: SpeechSynthesisVoice[], selectedVoiceURI: string) {
  const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceURI)

  if (selectedVoice) {
    return selectedVoice
  }

  return sortVoiceOptions(voices)[0]
}

function createCoachMessage(text: string): ChatMessage {
  return {
    id: makeId(),
    role: 'coach',
    text,
  }
}

function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getNowMs() {
  return Math.round(performance.timeOrigin + performance.now())
}

function getStarterPhrases(mode: PracticeMode, scenarioId?: string) {
  if (mode === 'freeTalk') {
    return ['Recently, I have been...', 'One reason is...', 'What do you think about...?']
  }

  const scenarioPhrases: Record<string, string[]> = {
    'airport-checkin': ['Could you please check...', 'Would it be possible to...', 'I would like to confirm...'],
    'interview-intro': ['One project I am proud of is...', 'The result was...', 'I learned that...'],
    'coffee-order': ['I would like...', 'Could you recommend...', 'I would prefer...'],
    'project-pitch': ['The key problem is...', 'Our solution is...', 'The next step is...'],
    'hotel-checkin': ['I have a reservation...', 'Could I check in now?', 'What time is checkout?'],
    'restaurant-order': ['Could we have a table...', 'I would like to order...', 'Could you recommend...?'],
    'business-meeting': ['The main update is...', 'Could we clarify...', 'The next action is...'],
    directions: ['How can I get to...', 'Which line should I take?', 'How long does it take?'],
  }

  return scenarioPhrases[scenarioId ?? 'airport-checkin'] ?? scenarioPhrases['airport-checkin']
}
