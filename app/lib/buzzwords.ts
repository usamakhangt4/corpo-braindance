const ADVERBS = [
  'algorithmically', 'asynchronously', 'autonomously', 'biometrically', 'cognitively', 
  'collaboratively', 'contextually', 'cybernetically', 'decentrally', 'disruptively', 
  'dynamically', 'efficiently', 'empathically', 'ethically', 'exponentially', 
  'frictionlessly', 'generatively', 'globally', 'holistically', 'hyper-locally', 
  'immersively', 'intelligently', 'interactively', 'iteratively', 'natively', 
  'organically', 'predictively', 'proactively', 'programmatically', 'quantumly', 
  'recursively', 'seamlessly', 'sustainably', 'synergistically', 'virtually'
];

const VERBS = [
  'accelerate', 'aggregate', 'align', 'amplify', 'architect', 'automate', 'benchmark', 
  'blockchainify', 'bootstrap', 'bridge', 'co-create', 'curate', 'decarbonize', 
  'decentralize', 'democratize', 'deploy', 'disrupt', 'empower', 'engineer', 'envision', 
  'evangelize', 'gamify', 'harness', 'ideate', 'incentivize', 'incubate', 'influence', 
  'iterate', 'leverage', 'manifest', 'monetize', 'onboard', 'optimize', 'orchestrate', 
  'pivot', 'prompt-engineer', 're-imagine', 'recalibrate', 'refactor', 'scale', 
  'streamline', 'supercharge', 'sync', 'synthesize', 'tokenize', 'transform', 'unlock', 
  'uplift', 'vectorize', 'visualize', 'whiteboard', 'zero-base'
];

const ADJECTIVES = [
  '24/7', 'agile', 'AI-driven', 'always-on', 'asynchronous', 'autonomous', 'bespoke', 
  'cloud-native', 'composable', 'cross-functional', 'cyber-resilient', 'data-driven', 
  'decentralized', 'digital-first', 'disruptive', 'edge-ready', 'elastic', 'empathic', 
  'end-to-end', 'enterprise-grade', 'frictionless', 'full-stack', 'future-proof', 
  'generative', 'granular', 'high-fidelity', 'hybrid', 'hyper-automated', 'immersive', 
  'impactful', 'inclusive', 'interoperable', 'low-code', 'mission-critical', 
  'multimodal', 'next-gen', 'no-code', 'omnichannel', 'on-demand', 'open-source', 
  'paradigm-shifting', 'phygital', 'predictive', 'purpose-driven', 'quantum-ready', 
  'real-time', 'resilient', 'scalable', 'self-healing', 'serverless', 'smart', 
  'state-of-the-art', 'sustainable', 'tokenized', 'ubiquitous', 'user-centric', 
  'value-added', 'viral', 'virtual', 'visionary', 'web3-enabled', 'zero-trust'
];

const NOUNS = [
  'agents', 'algorithms', 'alignments', 'architectures', 'blockchains', 'blueprints', 
  'chatbots', 'cloud formations', 'cohorts', 'communities', 'containers', 'copilots', 
  'core competencies', 'dashboards', 'data lakes', 'deliverables', 'digital twins', 
  'disruptors', 'ecosystems', 'flywheels', 'frameworks', 'funnels', 'gen-z sentiments', 
  'growth hacks', 'heuristics', 'hybrid models', 'infrastructures', 'insights', 
  'interfaces', 'KPIs', 'large language models', 'learnings', 'low-hanging fruit', 
  'metaverses', 'microservices', 'mindshare', 'neural networks', 'NFTs', 'north stars', 
  'OKRs', 'paradigms', 'pipelines', 'platforms', 'prompts', 'protocols', 'sandboxes', 
  'scrums', 'smart contracts', 'solutions', 'sprints', 'stacks', 'strategies', 
  'synergies', 'tech debts', 'thought leaders', 'touchpoints', 'transformers', 
  'user journeys', 'value propositions', 'vectors', 'verticals', 'workstreams'
];

const pickRandom = (arr: string | any[]) => arr[Math.floor(Math.random() * arr.length)];

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
};

// New: Templates to generate a "Definition"
const MEANING_TEMPLATES = [
  (adv: string, verb: string, adj: string, noun: string) => `We aim to ${adv} ${verb} our ${noun} by utilizing ${adj} methodologies.`,
  (adv: string, verb: string, adj: string, noun: string) => `Essentially, it's about ${adv} ${verb}ing the ${adj} ${noun} to drive KPI growth.`,
  (adv: string, verb: string, adj: string, noun: string) => `A strategy to ${verb} ${noun} in a ${adj} ecosystem, executed ${adv}.`,
  (adv: string, verb: string, adj: string, noun: string) => `This leverages ${adj} frameworks to ${adv} ${verb} mission-critical ${noun}.`,
  (adv: string, verb: string, adj: string, noun: string) => `By ${adv} ${verb}ing ${noun}, we ensure a ${adj} outcome for stakeholders.`
];

export function generateBuzzword(): { phrase: string, meaning: string } {
  const selectedAdverb = pickRandom(ADVERBS);
  const selectedVerb = pickRandom(VERBS);
  const selectedAdjective = pickRandom(ADJECTIVES);
  const selectedNoun = pickRandom(NOUNS);

  // Construct the main phrase
  const phrase = toTitleCase(`${selectedAdverb} ${selectedVerb} ${selectedAdjective} ${selectedNoun}`);

  // Construct the "Meaning"
  // We pick a random template and inject the selected words
  const template = pickRandom(MEANING_TEMPLATES);
  const meaning = template(selectedAdverb, selectedVerb, selectedAdjective, selectedNoun);

  return {
    phrase,
    meaning
  };
}