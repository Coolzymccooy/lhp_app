const URGENT_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'self-harm', 'self harm',
  'abuse', 'domestic violence', 'hurt myself', 'hurting myself', 'crisis',
  'danger', 'emergency', 'overdose', 'assault', 'rape', 'molested',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  grief: ['grief', 'loss', 'death', 'died', 'funeral', 'bereavement', 'mourning', 'passed away'],
  family: ['family', 'marriage', 'spouse', 'children', 'divorce', 'relationship', 'husband', 'wife', 'parent'],
  health: ['health', 'sick', 'illness', 'disease', 'hospital', 'cancer', 'surgery', 'healing', 'pain', 'medical'],
  finance: ['financial', 'money', 'debt', 'job', 'employment', 'work', 'business', 'bills', 'unemployed'],
  spiritual: ['faith', 'doubt', 'spiritual', 'salvation', 'purpose', 'God', 'direction', 'calling', 'prayer life'],
  mental: ['anxiety', 'depression', 'mental health', 'stress', 'overwhelmed', 'lonely', 'isolated', 'hopeless'],
};

export function triageRequest(text: string): { urgency: 'urgent' | 'normal'; category: string | null } {
  const lower = text.toLowerCase();

  const isUrgent = URGENT_KEYWORDS.some(kw => lower.includes(kw));

  let bestCategory: string | null = null;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return {
    urgency: isUrgent ? 'urgent' : 'normal',
    category: bestCategory,
  };
}
