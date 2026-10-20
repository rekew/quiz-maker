import type { Question } from "../api/client";

export interface PlayableQuestion extends Question {
  optionKeys: number[];
}

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle questions AND options, remapping correctIndices. */
export function shuffledQuiz(questions: Question[]): PlayableQuestion[] {
  return shuffled(questions).map((q) => {
    const order = shuffled(q.options.map((_, i) => i));
    return {
      question: q.question,
      options: order.map((i) => q.options[i]),
      optionKeys: order,
      correctIndices: q.correctIndices.map((ci) => order.indexOf(ci)),
    };
  });
}
