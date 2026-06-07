import {
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Coffee,
  Compass,
  FileText,
  Hotel,
  MessageSquareText,
  Mic2,
  Plane,
  Presentation,
  Sparkles,
  Target,
  Utensils,
  Wand2,
} from 'lucide-react'
import heroImage from '../assets/hero.png'
import sceneCafeImage from '../assets/scene-cafe.svg'
import sceneInterviewImage from '../assets/scene-interview.svg'
import scenePresentationImage from '../assets/scene-presentation.svg'
import sceneTravelImage from '../assets/scene-travel.svg'
import type { CoachFeedback, FeatureLink, LearnerLevel, Scenario, VocabularyItem } from '../types'

export const levels: LearnerLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export const heroPracticeImage = heroImage

export const scenarios: Scenario[] = [
  {
    id: 'airport-checkin',
    apiId: 'travel',
    titleZh: '机场值机',
    titleEn: 'Airport Check-in',
    level: 'A2-B1',
    descriptionZh: '练习办理登机、托运行李、选择座位、询问登机口和航班信息。',
    descriptionEn: 'Check in, confirm luggage, request a seat, and ask about boarding details.',
    characterName: 'Emma',
    characterRole: 'Airport Ground Staff',
    personality: 'Polite, professional, patient, and slightly formal.',
    openingMessage:
      'Good morning. Welcome to Skyway Airlines. May I see your passport and booking reference, please?',
    systemPrompt:
      'You are Emma, a polite and professional airport ground staff member. The user is practicing English for airport check-in. Stay in character. Ask for passport and booking reference, checked luggage, seat preference, boarding gate, and boarding time. Use simple, natural English suitable for A2-B1 learners. Ask one question at a time. Do not overcorrect during the conversation. When the practice ends, provide feedback in Chinese with grammar, fluency, natural expressions, and useful airport sentences.',
    image: sceneTravelImage,
    accent: 'blue',
    skills: ['passport', 'luggage', 'seat request'],
  },
  {
    id: 'interview-intro',
    apiId: 'interview',
    titleZh: '面试自我介绍',
    titleEn: 'Interview Self-introduction',
    level: 'B1-B2',
    descriptionZh: '练习英文面试开场、自我介绍、经历表达、优势说明和自然回答追问。',
    descriptionEn: 'Introduce your background, projects, strengths, and career motivation.',
    characterName: 'James',
    characterRole: 'Hiring Manager',
    personality: 'Professional, friendly, structured, and curious.',
    openingMessage:
      'Hi, nice to meet you. Thanks for joining the interview today. Could you please start by introducing yourself?',
    systemPrompt:
      'You are James, a professional but friendly HR interviewer. The user is practicing English self-introduction for job interviews. Ask follow-up questions about education, experience, projects, skills, motivation, and career goals. Keep the interview realistic. Ask one question at a time. Use B1-B2 level English. When the practice ends, provide feedback in Chinese covering structure, clarity, grammar, vocabulary, confidence, and an improved self-introduction.',
    image: sceneInterviewImage,
    accent: 'violet',
    skills: ['self intro', 'project story', 'motivation'],
  },
  {
    id: 'coffee-order',
    apiId: 'daily',
    titleZh: '咖啡店点单',
    titleEn: 'Coffee Ordering',
    level: 'A1-B1',
    descriptionZh: '练习日常点单、表达偏好、修改饮品、询问价格、外带或堂食。',
    descriptionEn: 'Order drinks, ask about size, milk, sweetness, and takeaway options.',
    characterName: 'Sophie',
    characterRole: 'Barista',
    personality: 'Warm, relaxed, casual, and encouraging.',
    openingMessage: 'Hi there! What can I get for you today?',
    systemPrompt:
      'You are Sophie, a friendly barista in a coffee shop. The user is practicing English for ordering coffee. Ask what they would like to order, size, hot or iced, milk choice, sugar, takeaway or dine-in, and tell the price at the end. Use simple casual English suitable for A1-B1 learners. Keep the conversation light and friendly. When the practice ends, provide feedback in Chinese with natural ordering expressions.',
    image: sceneCafeImage,
    accent: 'pink',
    skills: ['ordering', 'preference', 'small talk'],
  },
  {
    id: 'project-pitch',
    apiId: 'presentation',
    titleZh: '项目路演开场',
    titleEn: 'Project Pitch Opening',
    level: 'B1-B2',
    descriptionZh: '练习英文项目介绍、presentation 开场、问题背景、解决方案和下一步计划。',
    descriptionEn: 'Open a pitch, explain the problem, users, solution, and next step.',
    characterName: 'Olivia',
    characterRole: 'Project Judge',
    personality: 'Rational, focused, professional, and slightly challenging.',
    openingMessage:
      "Hi, welcome. You have two minutes to introduce your project. Please start whenever you're ready.",
    systemPrompt:
      'You are Olivia, a professional project judge, mentor, or investor. The user is practicing the opening of an English project pitch. Ask follow-up questions about the problem, target users, solution, competitors, business model, and next steps. Be professional and slightly challenging. Ask one question at a time. When the practice ends, provide feedback in Chinese covering pitch structure, logic, expression, conciseness, and an improved pitch opening.',
    image: scenePresentationImage,
    accent: 'amber',
    skills: ['problem', 'solution', 'next step'],
  },
  {
    id: 'hotel-checkin',
    apiId: 'travel',
    titleZh: '酒店入住',
    titleEn: 'Hotel Check-in',
    level: 'A2-B1',
    descriptionZh: '练习办理入住、确认预订、询问早餐、押金、房间设施和退房时间。',
    descriptionEn: 'Check a reservation, ask about breakfast, deposit, amenities, and checkout.',
    characterName: 'Mia',
    characterRole: 'Hotel Receptionist',
    personality: 'Calm, helpful, and service-oriented.',
    openingMessage: 'Good evening. Welcome to Riverlight Hotel. Do you have a reservation with us?',
    systemPrompt:
      'You are Mia, a helpful hotel receptionist. The user is practicing English for hotel check-in. Ask about reservation name, ID, room preference, breakfast, deposit, and checkout time. Keep the conversation natural and simple. Provide feedback in Chinese when the practice ends.',
    image: sceneTravelImage,
    accent: 'cyan',
    skills: ['reservation', 'room request', 'checkout'],
  },
  {
    id: 'restaurant-order',
    apiId: 'daily',
    titleZh: '餐厅点餐',
    titleEn: 'Restaurant Ordering',
    level: 'A2-B1',
    descriptionZh: '练习订位、点餐、过敏说明、推荐询问、结账和打包。',
    descriptionEn: 'Book a table, order food, explain allergies, ask for recommendations, and pay.',
    characterName: 'Noah',
    characterRole: 'Restaurant Server',
    personality: 'Friendly, efficient, and attentive.',
    openingMessage: 'Hi, welcome in. Do you have a reservation, or would you like a table for today?',
    systemPrompt:
      'You are Noah, a friendly restaurant server. The user is practicing English for restaurant ordering. Ask about table size, food choice, allergies, drinks, dessert, and payment. Keep English natural and suitable for A2-B1 learners. Provide feedback in Chinese when the practice ends.',
    image: sceneCafeImage,
    accent: 'rose',
    skills: ['menu', 'allergy', 'payment'],
  },
  {
    id: 'business-meeting',
    apiId: 'presentation',
    titleZh: '商务会议',
    titleEn: 'Business Meeting',
    level: 'B1-B2',
    descriptionZh: '练习会议开场、表达观点、澄清问题、推动下一步和确认行动项。',
    descriptionEn: 'Open a meeting, share opinions, clarify points, and agree on next actions.',
    characterName: 'Daniel',
    characterRole: 'Team Lead',
    personality: 'Focused, collaborative, and practical.',
    openingMessage: "Thanks for joining. Let's start with your update. What is the main progress this week?",
    systemPrompt:
      'You are Daniel, a team lead in a business meeting. The user is practicing English for workplace meetings. Ask about progress, blockers, priorities, decisions, and next actions. Keep the tone professional and collaborative. Provide feedback in Chinese when the practice ends.',
    image: scenePresentationImage,
    accent: 'indigo',
    skills: ['update', 'clarify', 'action items'],
  },
  {
    id: 'directions',
    apiId: 'travel',
    titleZh: '问路交通',
    titleEn: 'Directions & Transport',
    level: 'A1-A2',
    descriptionZh: '练习问路、换乘、买票、确认站点、询问时间和交通方式。',
    descriptionEn: 'Ask for directions, ticket options, stations, transfer routes, and travel time.',
    characterName: 'Lily',
    characterRole: 'Local Guide',
    personality: 'Patient, clear, and encouraging.',
    openingMessage: 'Hi there. Where would you like to go? I can help you find the best route.',
    systemPrompt:
      'You are Lily, a patient local guide. The user is practicing English for directions and transport. Ask where they want to go, explain route options, station names, tickets, transfer points, and travel time. Use short clear English. Provide feedback in Chinese when the practice ends.',
    image: sceneTravelImage,
    accent: 'green',
    skills: ['directions', 'tickets', 'transfer'],
  },
]

export const featureLinks: FeatureLink[] = [
  {
    title: '场景陪练',
    label: 'Role-play',
    description: '进入真实任务场景，和不同身份的角色完成一轮对话。',
    to: '/scenarios',
    icon: MessageSquareText,
  },
  {
    title: '自由对话',
    label: 'Free Talk',
    description: '选择聊天风格，围绕任意话题练习自然追问。',
    to: '/free-talk',
    icon: Brain,
  },
  {
    title: '语法表达诊断',
    label: 'Grammar Clinic',
    description: '检查一句话是否自然，获得改写和解释。',
    to: '/grammar-clinic',
    icon: Wand2,
  },
  {
    title: '学习计划',
    label: 'Study Plan',
    description: '按照水平、目标和每日时间生成 7 天训练计划。',
    to: '/study-plan',
    icon: CalendarDays,
  },
  {
    title: '词汇短语库',
    label: 'Phrases',
    description: '按场景积累可直接开口使用的表达。',
    to: '/phrases',
    icon: BookOpen,
  },
  {
    title: '我的进度',
    label: 'Progress',
    description: '查看练习次数、分数趋势和最近记录。',
    to: '/progress',
    icon: BarChart3,
  },
]

export const sidebarItems = [
  { label: 'Role-play', to: '/scenarios', icon: MessageSquareText },
  { label: 'Free Talk', to: '/free-talk', icon: Brain },
  { label: 'Grammar Clinic', to: '/grammar-clinic', icon: Wand2 },
  { label: 'Study Plan', to: '/study-plan', icon: CalendarDays },
  { label: 'Phrases', to: '/phrases', icon: BookOpen },
  { label: 'Progress', to: '/progress', icon: BarChart3 },
]

export const freeTalkRoles = [
  {
    title: 'Friendly Native Speaker',
    prompt:
      'You are a friendly native English speaker. Keep the conversation natural, warm, and curious. Ask one follow-up question at a time.',
  },
  {
    title: 'Patient English Tutor',
    prompt:
      'You are a patient English tutor. Keep the conversation easy to follow and gently reformulate unnatural sentences.',
  },
  {
    title: 'British Conversation Partner',
    prompt:
      'You are a British English conversation partner. Use natural British English and help the learner speak more smoothly.',
  },
  {
    title: 'American Conversation Partner',
    prompt:
      'You are an American English conversation partner. Use casual, clear American English and encourage longer answers.',
  },
]

export const phraseCategories = [
  'Daily conversation',
  'Business English',
  'Interview',
  'Travel',
  'Presentation',
  'Email',
]

export const phrasesByCategory: Record<string, VocabularyItem[]> = {
  'Daily conversation': [
    {
      phrase: 'What do you usually do after class?',
      meaning: '课后你通常做什么？',
      example: 'What do you usually do after class? I normally go to the library.',
    },
    {
      phrase: 'That sounds interesting.',
      meaning: '听起来很有意思。',
      example: 'That sounds interesting. Could you tell me more about it?',
    },
  ],
  'Business English': [
    {
      phrase: 'Could we align on the next step?',
      meaning: '我们能确认下一步吗？',
      example: 'Before we finish, could we align on the next step?',
    },
    {
      phrase: 'I would like to clarify one point.',
      meaning: '我想澄清一点。',
      example: 'I would like to clarify one point about the timeline.',
    },
  ],
  Interview: [
    {
      phrase: 'My specific role was to...',
      meaning: '我的具体职责是……',
      example: 'My specific role was to interview users and summarize their feedback.',
    },
    {
      phrase: 'This experience helped me develop...',
      meaning: '这段经历帮助我培养了……',
      example: 'This experience helped me develop stronger communication skills.',
    },
  ],
  Travel: [
    {
      phrase: "I'd like to check in, please.",
      meaning: '我想办理入住/值机。',
      example: "I'd like to check in, please. Here is my booking reference.",
    },
    {
      phrase: 'Could you tell me where the gate is?',
      meaning: '你能告诉我登机口在哪里吗？',
      example: 'Could you tell me where the gate is and when boarding starts?',
    },
  ],
  Presentation: [
    {
      phrase: 'The key problem is...',
      meaning: '核心问题是……',
      example: 'The key problem is that learners rarely get instant speaking feedback.',
    },
    {
      phrase: 'Our next milestone is...',
      meaning: '我们的下一个里程碑是……',
      example: 'Our next milestone is to test the product with twenty users.',
    },
  ],
  Email: [
    {
      phrase: 'I am writing to follow up on...',
      meaning: '我写信是为了跟进……',
      example: 'I am writing to follow up on our meeting yesterday.',
    },
    {
      phrase: 'Please let me know if this works for you.',
      meaning: '如果这样可以，请告诉我。',
      example: 'Please let me know if this works for you.',
    },
  ],
}

export const mockStudyPlan = [
  'Day 1: Record a 60-second self-introduction and improve one weak sentence.',
  'Day 2: Complete one role-play scenario and save five useful expressions.',
  'Day 3: Practice question follow-ups in Free Talk for ten minutes.',
  'Day 4: Rewrite three grammar clinic examples and read them aloud.',
  'Day 5: Use eight new phrases in a business or travel answer.',
  'Day 6: Repeat yesterday\'s answer with clearer pronunciation and pacing.',
  'Day 7: Run a full mock scenario and review your score changes.',
]

export const progressRecords = [
  { scene: 'Airport Check-in', score: 82, focus: 'Polite requests', time: 'Today 09:30' },
  { scene: 'Free Talk', score: 76, focus: 'Longer answers', time: 'Yesterday 18:20' },
  { scene: 'Grammar Clinic', score: 88, focus: 'Natural rewrite', time: 'Yesterday 11:15' },
  { scene: 'Project Pitch Opening', score: 79, focus: 'Clear structure', time: 'Monday 16:40' },
]

export const resultCorrections = [
  {
    before: 'I want check in.',
    after: "I'd like to check in, please.",
    note: 'Use a polite request form in service situations.',
  },
  {
    before: 'Where boarding?',
    after: 'Where is the boarding gate?',
    note: 'A complete question sounds clearer and more natural.',
  },
]

export const landingStats = [
  { value: '5', label: 'practice modes', icon: Sparkles },
  { value: 'Live', label: 'voice feedback', icon: Mic2 },
  { value: '100', label: 'score target', icon: Target },
]

export const scenarioIcons = {
  airport: Plane,
  interview: BriefcaseBusiness,
  coffee: Coffee,
  pitch: Presentation,
  hotel: Hotel,
  restaurant: Utensils,
  meeting: FileText,
  directions: Compass,
}

export const initialFeedback: CoachFeedback = {
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
