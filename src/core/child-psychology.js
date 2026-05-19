/**
 * ChildPsychology v1.1.1 — Developmental Psychology for AI
 *
 * Based on:
 * - Piaget's cognitive development stages
 * - Erikson's psychosocial development stages
 * - Attachment theory (Bowlby)
 * - Emotional development milestones
 * - Vygotsky's Zone of Proximal Development
 *
 * Purpose: Help AI understand human developmental psychology,
 *          especially for interacting with children or understanding
 *          adult issues rooted in childhood development.
 *
 * v1.1.1: Initial implementation
 */

const PIAGET_STAGES = {
  0: {
    name: 'Sensorimotor',
    age: '0-2 years',
    description: 'Learning through senses and motor actions',
    characteristics: [
      'Object permanence develops',
      'Cause and effect understanding',
      'Separation anxiety peaks',
      'Basic trust formation'
    ],
    ai_insight: 'Respond to emotional needs, not logical arguments'
  },
  2: {
    name: 'Preoperational',
    age: '2-7 years',
    description: 'Symbolic thinking, egocentrism',
    characteristics: [
      'Language explosion',
      'Egocentric thinking (cannot see others perspective)',
      'Imaginary friends common',
      'Magical thinking',
      'Difficulty with rules'
    ],
    ai_insight: 'Use simple language, validate emotions, be patient with irrational fears'
  },
  7: {
    name: 'Concrete Operational',
    age: '7-11 years',
    description: 'Logical thinking about concrete events',
    characteristics: [
      'Conservation understanding',
      'Classification skills',
      'Perspective-taking emerging',
      'Rule-based games understood',
      'Social comparison awareness'
    ],
    ai_insight: 'Can understand explanations, appreciate fairness, respond to logic'
  },
  12: {
    name: 'Formal Operational',
    age: '12+ years',
    description: 'Abstract and hypothetical thinking',
    characteristics: [
      'Abstract reasoning',
      'Hypothetical-deductive thinking',
      'Self-conscious about identity',
      'Future orientation',
      'Moral reasoning development'
    ],
    ai_insight: 'Can engage in philosophical discussion, values autonomy, needs respect'
  }
};

const ERIKSON_STAGES = {
  0: {
    crisis: 'Trust vs Mistrust',
    age: '0-1.5 years',
    description: 'Basic trust forms from caregiver reliability',
    positive: 'Hope, attachment security',
    negative: 'Anxiety, fear, mistrust',
    ai_insight: 'Be consistent, reliable, warm — this foundational trust affects all relationships'
  },
  1.5: {
    crisis: 'Autonomy vs Shame',
    age: '1.5-3 years',
    description: ' toddler seeks independence',
    positive: 'Willpower, determination',
    negative: 'Shame, self-doubt',
    ai_insight: 'Support autonomy, allow choices, avoid shaming'
  },
  3: {
    crisis: 'Initiative vs Guilt',
    age: '3-5 years',
    description: 'Purpose and direction seeking',
    positive: 'Purpose, direction',
    negative: 'Guilt, hesitation',
    ai_insight: 'Encourage exploration, celebrate efforts, avoid criticism of imagination'
  },
  6: {
    crisis: 'Industry vs Inferiority',
    age: '6-12 years',
    description: 'Competence through social comparison',
    positive: 'Competence, skills',
    negative: 'Inferiority, inadequacy',
    ai_insight: 'Acknowledge achievements, provide challenges, avoid comparison'
  },
  12: {
    crisis: 'Identity vs Role Confusion',
    age: '12-18 years',
    description: 'Self-definition and future direction',
    positive: 'Fidelity, commitment',
    negative: 'Role confusion, uncertainty',
    ai_insight: 'Support identity exploration, listen without judgment, respect autonomy'
  }
};

const ATTACHMENT_STYLES = {
  secure: {
    description: 'Healthy attachment',
    characteristics: [
      'Comfortable with intimacy',
      'Can seek support when needed',
      'Balanced independence and connection',
      'Trust in relationships'
    ],
    childhood_origin: 'Consistent, responsive caregiving',
    adult_pattern: 'Healthy adult relationships'
  },
  anxious: {
    description: 'Anxious-preoccupied attachment',
    characteristics: [
      'Fear of abandonment',
      'Needs reassurance',
      'Jealousy in relationships',
      'Low self-worth'
    ],
    childhood_origin: 'Inconsistent caregiving',
    adult_pattern: 'Clingy, demanding relationships'
  },
  avoidant: {
    description: 'Dismissive-avoidant attachment',
    characteristics: [
      'Discomfort with intimacy',
      'Self-reliant to a fault',
      'Emotional distance',
      'Dismisses emotions'
    ],
    childhood_origin: 'Rejecting or neglectful caregiving',
    adult_pattern: 'Distant, unavailable relationships'
  },
  disorganized: {
    description: 'Disorganized attachment',
    characteristics: [
      'Conflicted approach to relationships',
      'Fear and desire mixed',
      'Unpredictable behavior',
      'Trauma-linked'
    ],
    childhood_origin: 'Frightening or frightened caregiver',
    adult_pattern: 'Chaotic, unstable relationships'
  }
};

const EMOTIONAL_MILESTONES = {
  '0-3 months': {
    emotions: ['interest', 'distress', 'disgust', 'sadness'],
    social: ['social smile', 'recognition of caregiver']
  },
  '3-6 months': {
    emotions: ['joy', 'anger', 'fear'],
    social: ['prefers caregiver', 'stranger anxiety begins']
  },
  '6-12 months': {
    emotions: ['anxiety', 'affection', 'disappointment'],
    social: ['separation anxiety', 'pointing', 'wave bye-bye']
  },
  '1-2 years': {
    emotions: ['pride', 'shame', 'embarrassment', 'guilt'],
    social: ['parallel play', 'empathy emergence', 'tantrums']
  },
  '2-3 years': {
    emotions: ['empathy', 'jealousy', 'mocking'],
    social: ['sharing begins', 'best friend concept', 'pretend play']
  },
  '3-6 years': {
    emotions: ['complex social emotions', 'moral emotions'],
    social: ['friendships', 'cooperative play', 'understanding emotions of others']
  }
};

class ChildPsychology {
  constructor() {
    this.version = '1.1.1';
  }

  /**
   * Get Piaget's cognitive development stage for an age
   * @param {number} ageYears
   * @returns {object}
   */
  getPiagetStage(ageYears) {
    if (ageYears < 2) return PIAGET_STAGES[0];
    if (ageYears < 7) return PIAGET_STAGES[2];
    if (ageYears < 12) return PIAGET_STAGES[7];
    return PIAGET_STAGES[12];
  }

  /**
   * Get Erikson's psychosocial stage for an age
   * @param {number} ageYears
   * @returns {object}
   */
  getEriksonStage(ageYears) {
    if (ageYears < 1.5) return ERIKSON_STAGES[0];
    if (ageYears < 3) return ERIKSON_STAGES[1.5];
    if (ageYears < 6) return ERIKSON_STAGES[3];
    if (ageYears < 12) return ERIKSON_STAGES[6];
    return ERIKSON_STAGES[12];
  }

  /**
   * Analyze attachment style from behavioral patterns
   * @param {object} patterns - Behavioral patterns observed
   * @returns {object}
   */
  detectAttachmentStyle(patterns) {
    const {
      seeksCloseComfort = false,
      avoidsIntimacy = false,
      fearsAbandonment = false,
      showsInconsistentBehavior = false,
      hasTraumaHistory = false
    } = patterns;

    if (hasTraumaHistory && showsInconsistentBehavior) {
      return {
        style: 'disorganized',
        ...ATTACHMENT_STYLES.disorganized,
        recommendation: 'Seek professional support for attachment healing'
      };
    }
    if (avoidsIntimacy && !fearsAbandonment) {
      return {
        style: 'avoidant',
        ...ATTACHMENT_STYLES.avoidant,
        recommendation: 'Gradually build trust, respect boundaries, validate emotions'
      };
    }
    if (fearsAbandonment && !avoidsIntimacy) {
      return {
        style: 'anxious',
        ...ATTACHMENT_STYLES.anxious,
        recommendation: 'Provide consistent reassurance, be reliable, encourage self-worth'
      };
    }
    if (seeksCloseComfort && !fearsAbandonment && !avoidsIntimacy) {
      return {
        style: 'secure',
        ...ATTACHMENT_STYLES.secure,
        recommendation: 'Continue healthy relationship patterns'
      };
    }

    return {
      style: 'unknown',
      recommendation: 'More observation needed'
    };
  }

  /**
   * Get emotional milestone expectations for age
   * @param {string} ageRange - e.g., '2-3 years'
   * @returns {object}
   */
  getEmotionalMilestone(ageRange) {
    return EMOTIONAL_MILESTONES[ageRange] || null;
  }

  /**
   * Get AI interaction guidance for cognitive stage
   * @param {number} ageYears
   * @returns {object}
   */
  getInteractionGuidance(ageYears) {
    const piaget = this.getPiagetStage(ageYears);
    const erikson = this.getEriksonStage(ageYears);

    return {
      cognitive_stage: piaget.name,
      cognitive_age: piaget.age,
      psychosocial_crisis: erikson.crisis,
      ai_guidance: [
        piaget.ai_insight,
        erikson.ai_insight,
        this._getGeneralGuidance(ageYears)
      ],
      do: this._getDoList(ageYears),
      dont: this._getDontList(ageYears)
    };
  }

  _getGeneralGuidance(ageYears) {
    if (ageYears < 2) return 'Focus on emotional attunement, not teaching';
    if (ageYears < 7) return 'Validate feelings, use simple language, embrace imagination';
    if (ageYears < 12) return 'Support competence building, acknowledge efforts';
    return 'Respect autonomy, engage as equal, support identity exploration';
  }

  _getDoList(ageYears) {
    if (ageYears < 2) return [
      'Respond promptly to distress',
      'Use warm, consistent voice',
      'Mirror facial expressions',
      'Create secure base'
    ];
    if (ageYears < 7) return [
      'Give simple choices',
      'Validate emotions before logic',
      'Allow exploration without judgment',
      'Name emotions for them'
    ];
    if (ageYears < 12) return [
      'Acknowledge achievements',
      'Provide challenges',
      'Be fair and consistent',
      'Teach problem-solving'
    ];
    return [
      'Listen without judgment',
      'Respect privacy',
      'Engage as peer',
      'Support decision-making'
    ];
  }

  _getDontList(ageYears) {
    if (ageYears < 2) return [
      'Leave crying unattended',
      'Be unpredictable',
      'Rush or pressure'
    ];
    if (ageYears < 7) return [
      'Shame or ridicule',
      'Use long explanations',
      'Dismiss fears as irrational'
    ];
    if (ageYears < 12) return [
      'Compare to others',
      'Overwhelm with tasks',
      'Undermine confidence'
    ];
    return [
      'Control or dictate',
      'Dismiss opinions',
      'Invade privacy without cause'
    ];
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      version: this.version,
      piaget_stages: Object.keys(PIAGET_STAGES).length,
      erikson_stages: Object.keys(ERIKSON_STAGES).length,
      attachment_styles: Object.keys(ATTACHMENT_STYLES).length,
      emotional_milestones: Object.keys(EMOTIONAL_MILESTONES).length
    };
  }
}

module.exports = { ChildPsychology };
