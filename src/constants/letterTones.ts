export type LetterToneKey =
  | 'polite'
  | 'neutral'
  | 'assertive'
  | 'empathetic'
  | 'demanding'
  | 'custom';

export interface LetterToneOption {
  key: LetterToneKey;
  label: string;
  description: string;
  aiPrompt: string;
  recommended?: boolean;
}

export const LETTER_TONE_OPTIONS: LetterToneOption[] = [
  {
    key: 'polite',
    label: 'Polite',
    description: 'Professional, courteous, calm',
    aiPrompt:
      'Adopt a professional, courteous, and calm tone that remains respectful while clearly describing the issue.',
    recommended: true,
  },
  {
    key: 'neutral',
    label: 'Neutral',
    description: 'Factual, concise, objective',
    aiPrompt:
      'Use a factual, concise, and objective tone that focuses on verifiable details without emotional language.',
  },
  {
    key: 'assertive',
    label: 'Assertive',
    description: 'Confident, firm, action-oriented',
    aiPrompt:
      'Adopt a confident, firm tone that clearly states expectations and required actions without sounding aggressive.',
  },
  {
    key: 'empathetic',
    label: 'Empathetic',
    description: 'Warm and understanding',
    aiPrompt:
      'Use a warm, understanding tone that acknowledges feelings while still presenting the request professionally.',
  },
  {
    key: 'demanding',
    label: 'Demanding',
    description: 'Strong request and urgency',
    aiPrompt:
      'Use a direct, urgent tone that conveys the seriousness of the issue and the need for immediate corrective action.',
  },
  {
    key: 'custom',
    label: 'Custom tone...',
    description: 'Provide your own tone instructions',
    aiPrompt: '',
  },
];

export const findToneOption = (key: LetterToneKey) =>
  LETTER_TONE_OPTIONS.find((option) => option.key === key);
