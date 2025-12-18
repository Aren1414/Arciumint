export type DiscTrait = "D" | "I" | "S" | "C";

export interface DiscOption {
  text: string;
  trait: DiscTrait;
}

export interface DiscQuestion {
  id: number;
  text: string;
  options: DiscOption[];
}

export const discQuestions: DiscQuestion[] = [
  {
    id: 1,
    text: "When starting a new task, you usually:",
    options: [
      { text: "Take charge and move quickly", trait: "D" },
      { text: "Talk it through with others", trait: "I" },
      { text: "Prefer a steady, calm approach", trait: "S" },
      { text: "Analyze all details before acting", trait: "C" },
    ],
  },
  {
    id: 2,
    text: "In group situations, you are more likely to:",
    options: [
      { text: "Lead the discussion", trait: "D" },
      { text: "Energize and motivate others", trait: "I" },
      { text: "Support and listen carefully", trait: "S" },
      { text: "Observe and evaluate quietly", trait: "C" },
    ],
  },
  {
    id: 3,
    text: "When faced with conflict, you tend to:",
    options: [
      { text: "Confront it directly", trait: "D" },
      { text: "Defuse it with communication", trait: "I" },
      { text: "Seek harmony and compromise", trait: "S" },
      { text: "Rely on rules and logic", trait: "C" },
    ],
  },
  {
    id: 4,
    text: "You feel most comfortable when:",
    options: [
      { text: "You are in control of outcomes", trait: "D" },
      { text: "You can express yourself freely", trait: "I" },
      { text: "Things feel predictable and safe", trait: "S" },
      { text: "Everything is accurate and correct", trait: "C" },
    ],
  },
  {
    id: 5,
    text: "Others often describe you as:",
    options: [
      { text: "Decisive and strong-willed", trait: "D" },
      { text: "Outgoing and enthusiastic", trait: "I" },
      { text: "Patient and dependable", trait: "S" },
      { text: "Precise and thoughtful", trait: "C" },
    ],
  },
  {
    id: 6,
    text: "When making decisions, you prioritize:",
    options: [
      { text: "Speed and results", trait: "D" },
      { text: "People and feelings", trait: "I" },
      { text: "Stability and consistency", trait: "S" },
      { text: "Data and accuracy", trait: "C" },
    ],
  },
  {
    id: 7,
    text: "Under pressure, you usually:",
    options: [
      { text: "Push harder to overcome obstacles", trait: "D" },
      { text: "Talk more and seek reassurance", trait: "I" },
      { text: "Stay calm and patient", trait: "S" },
      { text: "Double-check everything", trait: "C" },
    ],
  },
  {
    id: 8,
    text: "Your work style is best described as:",
    options: [
      { text: "Fast-paced and goal-driven", trait: "D" },
      { text: "Collaborative and expressive", trait: "I" },
      { text: "Methodical and supportive", trait: "S" },
      { text: "Structured and detail-oriented", trait: "C" },
    ],
  },
  {
    id: 9,
    text: "When learning something new, you prefer:",
    options: [
      { text: "Trying it immediately", trait: "D" },
      { text: "Learning with others", trait: "I" },
      { text: "Step-by-step guidance", trait: "S" },
      { text: "Clear instructions and examples", trait: "C" },
    ],
  },
  {
    id: 10,
    text: "In meetings, you tend to:",
    options: [
      { text: "Drive decisions forward", trait: "D" },
      { text: "Share ideas openly", trait: "I" },
      { text: "Ensure everyone is heard", trait: "S" },
      { text: "Focus on facts and details", trait: "C" },
    ],
  },
  {
    id: 11,
    text: "You are most motivated by:",
    options: [
      { text: "Achieving goals", trait: "D" },
      { text: "Recognition and approval", trait: "I" },
      { text: "Security and cooperation", trait: "S" },
      { text: "Quality and correctness", trait: "C" },
    ],
  },
  {
    id: 12,
    text: "People rely on you to:",
    options: [
      { text: "Make tough calls", trait: "D" },
      { text: "Lift morale", trait: "I" },
      { text: "Be dependable", trait: "S" },
      { text: "Ensure accuracy", trait: "C" },
    ],
  },
  {
    id: 13,
    text: "Change makes you feel:",
    options: [
      { text: "Excited and challenged", trait: "D" },
      { text: "Optimistic and curious", trait: "I" },
      { text: "Cautious but adaptable", trait: "S" },
      { text: "Concerned about risks", trait: "C" },
    ],
  },
  {
    id: 14,
    text: "When working with others, you value:",
    options: [
      { text: "Efficiency", trait: "D" },
      { text: "Communication", trait: "I" },
      { text: "Trust", trait: "S" },
      { text: "Clarity", trait: "C" },
    ],
  },
  {
    id: 15,
    text: "Your biggest strength is:",
    options: [
      { text: "Taking initiative", trait: "D" },
      { text: "Inspiring others", trait: "I" },
      { text: "Being consistent", trait: "S" },
      { text: "Being thorough", trait: "C" },
    ],
  },
  {
    id: 16,
    text: "You prefer feedback that is:",
    options: [
      { text: "Direct and concise", trait: "D" },
      { text: "Positive and encouraging", trait: "I" },
      { text: "Gentle and supportive", trait: "S" },
      { text: "Specific and detailed", trait: "C" },
    ],
  },
  {
    id: 17,
    text: "Your pace of work is usually:",
    options: [
      { text: "Fast", trait: "D" },
      { text: "Variable", trait: "I" },
      { text: "Steady", trait: "S" },
      { text: "Careful", trait: "C" },
    ],
  },
  {
    id: 18,
    text: "When planning, you focus more on:",
    options: [
      { text: "End results", trait: "D" },
      { text: "People involved", trait: "I" },
      { text: "Maintaining balance", trait: "S" },
      { text: "Process and structure", trait: "C" },
    ],
  },
  {
    id: 19,
    text: "You feel stressed when:",
    options: [
      { text: "Progress is slow", trait: "D" },
      { text: "You feel ignored", trait: "I" },
      { text: "There is conflict", trait: "S" },
      { text: "Things are unclear", trait: "C" },
    ],
  },
  {
    id: 20,
    text: "Your communication style is:",
    options: [
      { text: "Direct and assertive", trait: "D" },
      { text: "Expressive and friendly", trait: "I" },
      { text: "Calm and reassuring", trait: "S" },
      { text: "Precise and factual", trait: "C" },
    ],
  },
  {
    id: 21,
    text: "You prefer work environments that are:",
    options: [
      { text: "Challenging", trait: "D" },
      { text: "Social", trait: "I" },
      { text: "Stable", trait: "S" },
      { text: "Organized", trait: "C" },
    ],
  },
  {
    id: 22,
    text: "When solving problems, you:",
    options: [
      { text: "Act quickly", trait: "D" },
      { text: "Brainstorm openly", trait: "I" },
      { text: "Consult others", trait: "S" },
      { text: "Analyze deeply", trait: "C" },
    ],
  },
  {
    id: 23,
    text: "You are more comfortable with:",
    options: [
      { text: "Taking risks", trait: "D" },
      { text: "Trying new experiences", trait: "I" },
      { text: "Familiar routines", trait: "S" },
      { text: "Proven methods", trait: "C" },
    ],
  },
  {
    id: 24,
    text: "Others see you as someone who:",
    options: [
      { text: "Gets things done", trait: "D" },
      { text: "Brings energy", trait: "I" },
      { text: "Keeps peace", trait: "S" },
      { text: "Maintains standards", trait: "C" },
    ],
  },
  {
    id: 25,
    text: "You are most satisfied when:",
    options: [
      { text: "You win or succeed", trait: "D" },
      { text: "Everyone enjoys the process", trait: "I" },
      { text: "Everyone feels comfortable", trait: "S" },
      { text: "Everything is done right", trait: "C" },
    ],
  },
  {
    id: 26,
    text: "When receiving instructions, you prefer:",
    options: [
      { text: "Freedom to decide", trait: "D" },
      { text: "Verbal explanation", trait: "I" },
      { text: "Clear expectations", trait: "S" },
      { text: "Written guidelines", trait: "C" },
    ],
  },
  {
    id: 27,
    text: "Your approach to goals is:",
    options: [
      { text: "Aggressive", trait: "D" },
      { text: "Optimistic", trait: "I" },
      { text: "Consistent", trait: "S" },
      { text: "Careful", trait: "C" },
    ],
  },
  {
    id: 28,
    text: "You feel most confident when:",
    options: [
      { text: "You are leading", trait: "D" },
      { text: "You are connecting with others", trait: "I" },
      { text: "You are helping others", trait: "S" },
      { text: "You are certain of correctness", trait: "C" },
    ],
  },
];
