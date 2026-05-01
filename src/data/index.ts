import { questions } from './questions';
import { questions2 } from './questions2';
import { questions3 } from './questions3';
import { Question } from '../types';

export const allQuestions: Question[] = [
  ...questions,
  ...questions2,
  ...questions3
];

export const getQuestionsByModule = (module: string): Question[] => {
  return allQuestions.filter(q => q.module === module);
};

export const getModules = (): string[] => {
  const modules = new Set(allQuestions.map(q => q.module).filter(Boolean) as string[]);
  return Array.from(modules);
};
