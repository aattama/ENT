export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
  module?: string;
  topic?: string;
}
