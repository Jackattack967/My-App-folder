import { addDays } from "./dates";
import type { Deck, Exam, SavedOutline } from "./types";

// Example content each tool opens with, so it's clear what it does
// before anyone types. It's replaced as soon as the student saves anything.

export function exampleExams(today: string): Exam[] {
  return [
    {
      id: "example-bio",
      subject: "Biology",
      date: addDays(today, 9),
      topics: [
        { id: "t1", name: "Cell division", confidence: 2 },
        { id: "t2", name: "Genetics", confidence: 3 },
        { id: "t3", name: "Photosynthesis", confidence: 4 },
        { id: "t4", name: "Ecology", confidence: 5 },
      ],
      done: [],
    },
    {
      id: "example-history",
      subject: "History",
      date: addDays(today, 16),
      topics: [
        { id: "t5", name: "Causes of WWI", confidence: 2 },
        { id: "t6", name: "Treaty of Versailles", confidence: 3 },
        { id: "t7", name: "Rise of dictatorships", confidence: 1 },
      ],
      done: [],
    },
  ];
}

export const EXAMPLE_DECKS: Deck[] = [
  {
    id: "example-cell-division",
    subject: "Bio",
    name: "Cell Division",
    createdAt: 0,
    cards: [
      ["What is mitosis?", "Cell division that makes two genetically identical daughter cells."],
      ["What are the phases of mitosis, in order?", "Prophase, metaphase, anaphase, telophase (PMAT)."],
      ["What happens during interphase?", "The cell grows and copies its DNA before dividing."],
      ["What happens in metaphase?", "Chromosomes line up along the middle of the cell."],
      ["What happens in anaphase?", "Sister chromatids are pulled apart to opposite ends of the cell."],
      ["What is cytokinesis?", "Division of the cytoplasm, splitting one cell into two."],
      ["What does a centromere do?", "Holds the two sister chromatids together."],
      ["How many cells does meiosis produce?", "Four genetically different cells, each with half the chromosomes."],
      ["What is meiosis used for?", "Making gametes (sex cells: sperm and egg cells)."],
    ].map(([question, answer], i) => ({ id: `ex-${i}`, question, answer, box: 0 })),
  },
];

export const EXAMPLE_NOTES = `Photosynthesis – notes from class

Plants make their own food using light energy. This happens in the chloroplasts, which contain a green pigment called chlorophyll that absorbs light (mostly red and blue light, reflects green).

Word equation: carbon dioxide + water → glucose + oxygen (needs light energy)

Carbon dioxide enters the leaf through tiny pores called stomata. Water is taken up by the roots and travels up through the xylem.

Two stages:
1. Light-dependent reactions (in the thylakoids) – light energy splits water, releasing oxygen.
2. Calvin cycle / light-independent reactions (in the stroma) – carbon dioxide is turned into glucose.

Limiting factors: light intensity, carbon dioxide concentration, temperature. If one is low, the rate of photosynthesis is limited even if the others are high.

Plants use glucose for respiration, to make cellulose for cell walls, and store it as starch.`;

export const EXAMPLE_OUTLINES: SavedOutline[] = [
  {
    id: "example-outline",
    prompt: "Should high schools ban phones during class? Take a clear position and defend it.",
    essayType: "argumentative",
    wordCount: 800,
    createdAt: 0,
    outline: {
      thesis:
        "Schools should ban phones during class because they cut into focus and learning, though teachers should have a clear way to allow them for specific lessons.",
      thesisTip:
        "Decide how strict you really want to be (full ban vs. ban with exceptions) and make your thesis say exactly that.",
      paragraphs: [
        {
          label: "Intro",
          approxWords: 110,
          mainPoint: "Hook the reader and state your position.",
          points: [
            "Hook: a moment from your own classes when phones got in the way",
            "Context: more schools trying bans",
            "Thesis + preview of your reasons",
          ],
          evidenceToFind: ["Whether your school or district has a phone policy, and what it says"],
        },
        {
          label: "Body 1: Focus",
          approxWords: 170,
          mainPoint: "Phones split attention, even when they aren't being used.",
          points: ["Notifications pull attention away", "Switching tasks costs time to refocus", "Link back: less focus = less learning"],
          evidenceToFind: ["A study on phones and attention or test scores (search education research databases)"],
        },
        {
          label: "Body 2: Social side",
          approxWords: 170,
          mainPoint: "Phone-free class time helps students talk and work with each other.",
          points: ["Group work and discussion", "Less pressure from social media during the day"],
          evidenceToFind: ["Reports from a school that introduced a ban, e.g. news coverage or the school's own update"],
        },
        {
          label: "Body 3: Counterargument",
          approxWords: 180,
          mainPoint: "Answer the strongest objection: phones are useful tools and needed for emergencies.",
          points: ["State the objection fairly", "Response: teacher-approved use, office phones for emergencies", "Show why your rule still works"],
          evidenceToFind: ["What parents' or students' groups say against bans"],
        },
        {
          label: "Conclusion",
          approxWords: 120,
          mainPoint: "Pull your reasons together and leave the reader with something to think about.",
          points: ["Restate thesis in fresh words", "Bigger picture: what kind of classroom do we want?"],
          evidenceToFind: [],
        },
      ],
      evidenceToLookFor: [
        "One or two research studies on phones and learning",
        "A real school or country that tried a ban, and what happened",
        "Your school's current policy",
        "A strong quote from someone who disagrees with you",
      ],
      questionsToConsider: [
        "Would you support this rule if you were a teacher? A parent?",
        "Where exactly would you draw the line for exceptions?",
        "What's the best argument against you, and is it actually wrong?",
      ],
    },
  },
];
