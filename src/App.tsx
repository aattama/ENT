/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw, 
  Award,
  BookMarked,
  LayoutDashboard,
  BrainCircuit,
  Info
} from 'lucide-react';
import { allQuestions, getModules } from './data';
import { Question } from './types';
import { shuffleArray, formatTime } from './lib/utils';

type AppState = 'HOME' | 'QUIZ' | 'RESULTS';

export default function App() {
  const [state, setState] = useState<AppState>('HOME');
  const [selectedModule, setSelectedModule] = useState<string | 'ALL'>('ALL');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  // Initialize Quiz
  const startQuiz = (module: string | 'ALL') => {
    let filtered = module === 'ALL' ? allQuestions : allQuestions.filter(q => q.module === module);
    // Sort or shuffle? user asked for all questions to be displayed
    setCurrentQuestions(filtered); 
    setUserAnswers({});
    setCurrentIndex(0);
    setTimeRemaining(filtered.length * 60); // 1 minute per question
    setQuizStartTime(Date.now());
    setState('QUIZ');
  };

  // Timer logic
  useEffect(() => {
    let timer: number;
    if (state === 'QUIZ' && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setState('RESULTS');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, timeRemaining]);

  const handleOptionSelect = (optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const nextQuestion = useCallback(() => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, currentQuestions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const calculateScore = () => {
    let score = 0;
    currentQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  const hasAnswered = userAnswers[currentIndex] !== undefined;

  return (
    <div id="app-root" className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-20">
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setState('HOME')}>
            <div className="bg-[#3b82f6] p-1.5 rounded-lg text-white">
              <BrainCircuit size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight hidden md:block">EntrePrep CBT</h1>
          </div>
          
          {state === 'QUIZ' && (
            <>
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-1.5 text-sm font-bold bg-[#f1f5f9] px-3 py-1.5 rounded-full">
                  <Clock size={16} className={timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                  <span className={timeRemaining < 300 ? 'text-red-600' : 'text-slate-700'}>{formatTime(timeRemaining)}</span>
                </div>
                
                <button
                  onClick={() => setState('RESULTS')}
                  id="btn-final-submit"
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-200"
                >
                  Submit Exam
                </button>
              </div>
            </>
          )}

          {state === 'RESULTS' && (
             <button
              onClick={() => setState('HOME')}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm ml-auto"
            >
              Return Home
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {state === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
              id="home-view"
            >
              <div className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-[#dbeafe] text-[#1d4ed8] text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                    COURSE CBT PORTAL
                  </span>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                    Theory of Entrepreneurship <br/><span className="text-[#3b82f6]">& Innovation</span>
                  </h2>
                  <p className="text-slate-500 max-w-xl text-lg mb-8 leading-relaxed">
                    Practice with the full database of 300+ high-quality questions and detailed explanations.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-[#10b981]" />
                      <span className="text-sm font-medium">300+ Detailed Questions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div id="module-select" className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <LayoutDashboard size={20} className="text-[#3b82f6]" />
                  Available Examinations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <ModuleCard 
                    title="Full Comprehensive Exam" 
                    desc="Start your exam with the complete database of 300+ questions covering all modules."
                    count={allQuestions.length}
                    onClick={() => startQuiz('ALL')}
                    id="btn-start-all"
                  />
                  {getModules().map((m, i) => (
                    <ModuleCard 
                      key={m}
                      title={m}
                      desc={`Focus only on questions from ${m}`}
                      count={allQuestions.filter(q => q.module === m).length}
                      onClick={() => startQuiz(m)}
                      id={`btn-start-module-${i}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {state === 'QUIZ' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
              id="quiz-view"
            >
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e2e8f0] shadow-md min-h-[400px] flex flex-col justify-center">
                <div className="mb-6 flex justify-between items-start">
                  <span className="text-[#3b82f6] text-xs font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                    {currentQuestions[currentIndex].module} : {currentQuestions[currentIndex].topic}
                  </span>
                </div>
                <h3 id="question-text" className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight mb-10">
                  {currentQuestions[currentIndex].question}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestions[currentIndex].options.map((option, idx) => {
                    const isSelected = userAnswers[currentIndex] === idx;
                    
                    return (
                      <button
                        key={idx}
                        id={`option-${idx}`}
                        onClick={() => handleOptionSelect(idx)}
                        className={`w-full text-left p-5 rounded-2xl border-2 font-semibold transition-all group relative overflow-hidden ${
                          isSelected 
                          ? "bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg shadow-blue-100" 
                          : "bg-white border-[#f1f5f9] text-slate-600 hover:border-[#3b82f6] hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${isSelected ? 'bg-white/20 border-white/40' : 'bg-slate-50 border-slate-200'}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-slate-400 text-xs px-2">
                <span>Select an option and use the arrow buttons above to navigate.</span>
                <span>Exam auto-submits when time expires.</span>
              </div>
            </motion.div>
          )}

          {state === 'RESULTS' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
              id="results-view"
            >
              <div className="bg-white rounded-3xl p-10 border border-[#e2e8f0] shadow-sm text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-yellow-50 p-5 rounded-full">
                    <Award size={64} className="text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Examination Summary</h2>
                <p className="text-slate-500 mb-8 font-medium">Review your performance and detailed explanations below.</p>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="block text-3xl font-black text-slate-900">{calculateScore()} / {currentQuestions.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="block text-3xl font-black text-slate-900">{Math.round((calculateScore() / currentQuestions.length) * 100)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setState('HOME')}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                >
                  Take Another Exam
                </button>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2">Questions Review</h3>
                {currentQuestions.map((q, qIndex) => {
                  const userAns = userAnswers[qIndex];
                  const isCorrect = userAns === q.correctAnswer;
                  
                  return (
                    <div key={qIndex} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-slate-800 leading-snug">
                          {qIndex + 1}. {q.question}
                        </h4>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shrink-0 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oIdx) => {
                          let borderClass = "border-slate-100 opacity-60";
                          let icon = null;
                          
                          if (oIdx === q.correctAnswer) {
                            borderClass = "border-green-500 bg-green-50/50 opacity-100";
                            icon = <CheckCircle2 size={14} className="text-green-600" />;
                          } else if (oIdx === userAns) {
                            borderClass = "border-red-500 bg-red-50/50 opacity-100";
                            icon = <AlertCircle size={14} className="text-red-600" />;
                          }

                          return (
                            <div key={oIdx} className={`p-3 rounded-xl border-2 flex items-center justify-between text-sm ${borderClass}`}>
                              <span>{opt}</span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-[#f0f9ff] p-4 rounded-xl border border-blue-100 flex gap-3">
                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900 leading-relaxed italic">
                          <span className="font-bold">Explanation:</span> {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-xs mb-20 sm:mb-0">
        <p>© 2026 EntrePrep CBT. Content referenced from NOUN GST 204 / ENT 209.</p>
      </footer>

      {state === 'QUIZ' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} className="rotate-180" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Question</span>
              <span className="text-lg font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                {currentIndex + 1} / {currentQuestions.length}
              </span>
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentIndex === currentQuestions.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-black disabled:opacity-30 transition-all shadow-lg shadow-slate-200"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleCard({ title, desc, count, onClick, id }: { title: string, desc: string, count: number, onClick: () => void, id: string, key?: React.Key }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm hover:border-[#3b82f6] hover:shadow-md transition-all text-left flex flex-col justify-between group h-full"
    >
      <div className="space-y-2 mb-6">
        <h4 className="font-bold text-slate-900 group-hover:text-[#3b82f6] transition-colors line-clamp-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-black bg-[#f1f5f9] px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">
          {count} QUESTIONS
        </span>
        <ChevronRight size={16} className="text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform" />
      </div>
    </button>
  );
}
