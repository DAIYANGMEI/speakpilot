import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CoachPage } from './pages/CoachPage'
import { DashboardPage } from './pages/DashboardPage'
import { FreeTalkPage } from './pages/FreeTalkPage'
import { GrammarClinicPage } from './pages/GrammarClinicPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { PhrasesPage } from './pages/PhrasesPage'
import { ProgressPage } from './pages/ProgressPage'
import { ScenariosPage } from './pages/ScenariosPage'
import { SessionResultPage } from './pages/SessionResultPage'
import { StudyPlanPage } from './pages/StudyPlanPage'

function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<ScenariosPage />} path="/scenarios" />
      <Route element={<CoachPage />} path="/coach" />
      <Route element={<CoachPage />} path="/coach/:scenarioId" />
      <Route element={<FreeTalkPage />} path="/free-talk" />
      <Route element={<GrammarClinicPage />} path="/grammar-clinic" />
      <Route element={<StudyPlanPage />} path="/study-plan" />
      <Route element={<PhrasesPage />} path="/phrases" />
      <Route element={<ProgressPage />} path="/progress" />
      <Route element={<SessionResultPage />} path="/session-result" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
