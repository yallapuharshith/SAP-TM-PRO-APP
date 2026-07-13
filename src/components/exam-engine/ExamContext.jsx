import { createContext, useContext } from 'react';

export const ExamContext = createContext(null);

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used inside ExamProvider');
  }
  return context;
}
