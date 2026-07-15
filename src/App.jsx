import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { ExamProvider } from './components/exam-engine/ExamProvider';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ExamInstructions from './pages/ExamInstructions';
import ExamPage from './pages/ExamPage';
import ExamResult from './pages/ExamResult';
import SmartRevision from './pages/SmartRevision';

function App() {
  return (
    <ExamProvider>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell pageTitle="Dashboard">
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/study"
          element={
            <AppShell pageTitle="Study">
              <Study />
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
              <Analytics />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell pageTitle="Settings">
              <Settings />
            </AppShell>
          }
        />
      </Routes>
    </ExamProvider>
  );
}

export default App;
