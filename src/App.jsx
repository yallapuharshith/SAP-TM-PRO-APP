import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { ExamProvider } from './components/exam-engine/ExamProvider';
import ExamInstructions from './pages/ExamInstructions';
import ExamPage from './pages/ExamPage';
import ExamResult from './pages/ExamResult';
import SmartRevision from './pages/SmartRevision';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudyNotes = lazy(() => import('./pages/StudyNotes'));
const HandsOnLabs = lazy(() => import('./pages/HandsOnLabs'));
const CapstoneProjects = lazy(() => import('./pages/CapstoneProjects'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

function StudyNotesRoute() {
  const [searchParams] = useSearchParams();
  const pageTitle = searchParams.get('section') === 'viva' ? 'Viva Preparation' : 'Study Notes';

  return (
    <AppShell pageTitle={pageTitle}>
      <Suspense fallback={<RouteFallback />}>
        <StudyNotes />
      </Suspense>
    </AppShell>
  );
}

function RouteFallback() {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft">
      <p className="text-sm text-slate-300">Loading module...</p>
    </div>
  );
}

function App() {
  return (
    <ExamProvider>
      <Routes>
        <Route path="/SAP-TM-PRO-APP" element={<Navigate to="/" replace />} />
        <Route path="/SAP-TM-PRO-APP/*" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <AppShell pageTitle="Dashboard">
              <Suspense fallback={<RouteFallback />}>
                <Dashboard />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/study-notes"
          element={<StudyNotesRoute />}
        />
        <Route path="/viva-preparation" element={<Navigate to="/study-notes?section=viva" replace />} />
        <Route
          path="/hands-on-labs"
          element={
            <AppShell pageTitle="Hands-on Labs">
              <Suspense fallback={<RouteFallback />}>
                <HandsOnLabs />
              </Suspense>
            </AppShell>
          }
        />
        <Route path="/admin" element={<Navigate to="/settings" replace />} />
        <Route
          path="/capstone-projects"
          element={
            <AppShell pageTitle="Capstone Projects">
              <Suspense fallback={<RouteFallback />}>
                <CapstoneProjects />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/exam"
          element={
            <AppShell pageTitle="Exam Instructions">
              <ExamInstructions />
            </AppShell>
          }
        />
        <Route
          path="/exam/start"
          element={
            <AppShell pageTitle="Exam Engine">
              <ExamPage />
            </AppShell>
          }
        />
        <Route
          path="/exam/module/:moduleId"
          element={
            <AppShell pageTitle="Module Exam Instructions">
              <ExamInstructions />
            </AppShell>
          }
        />
        <Route
          path="/exam/module/:moduleId/test"
          element={
            <AppShell pageTitle="Module Question Test">
              <ExamPage />
            </AppShell>
          }
        />
        <Route
          path="/exam/result"
          element={
            <AppShell pageTitle="Exam Result">
              <ExamResult />
            </AppShell>
          }
        />
        <Route
          path="/revision"
          element={
            <AppShell pageTitle="Smart Revision">
              <SmartRevision />
            </AppShell>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppShell pageTitle="Analytics">
              <Suspense fallback={<RouteFallback />}>
                <Analytics />
              </Suspense>
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell pageTitle="Settings">
              <Suspense fallback={<RouteFallback />}>
                <Settings />
              </Suspense>
            </AppShell>
          }
        />
        <Route path="/study" element={<Navigate to="/study-notes" replace />} />
      </Routes>
    </ExamProvider>
  );
}

export default App;
