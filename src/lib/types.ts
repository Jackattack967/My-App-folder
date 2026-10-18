import type { EssayOutline, EssayType } from "./schemas";

export type Card = {
  id: string;
  question: string;
  answer: string;
  /** Leitner box: 0 = new or missed, goes up each time you get it right. */
  box: number;
};

export type Deck = {
  id: string;
  subject: string;
  name: string;
  cards: Card[];
  createdAt: number;
};

export type Topic = {
  id: string;
  name: string;
  /** 1 = lost, 5 = got this. */
  confidence: number;
};

export type Exam = {
  id: string;
  subject: string;
  /** YYYY-MM-DD */
  date: string;
  topics: Topic[];
  /** Keys of study sessions ticked off. */
  done: string[];
};

export type SavedOutline = {
  id: string;
  prompt: string;
  essayType: EssayType;
  wordCount: number;
  createdAt: number;
  outline: EssayOutline;
};
