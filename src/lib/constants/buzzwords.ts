/**
 * Curated, local content for the jargon generator.
 *
 * A voice determines the corporate tone. A technology field supplies compatible
 * actions and subjects, so the generator can cover the full stack without
 * producing unrelated word salad.
 */

export const BUZZWORD_ROLES = ['ceo', 'sales', 'tech'] as const

export const ROLE_LABELS: Record<string, string> = {
  ceo: 'VISIONARY',
  sales: 'GROWTH',
  tech: 'ENGINEERING',
} as const

export const TECH_FIELDS = [
  { id: 'frontend', label: 'FRONTEND & WEB', group: 'core' },
  { id: 'mobile', label: 'MOBILE', group: 'core' },
  { id: 'backend', label: 'BACKEND & APIs', group: 'core' },
  { id: 'data', label: 'DATA & DATABASES', group: 'core' },
  { id: 'cloud', label: 'CLOUD & INFRASTRUCTURE', group: 'infrastructure' },
  { id: 'platform', label: 'PLATFORM ENGINEERING', group: 'infrastructure' },
  { id: 'reliability', label: 'RELIABILITY & OBSERVABILITY', group: 'infrastructure' },
  { id: 'security', label: 'CYBERSECURITY', group: 'infrastructure' },
  { id: 'identity', label: 'PRIVACY & IDENTITY', group: 'infrastructure' },
  { id: 'edge', label: 'EDGE, NETWORKS & IOT', group: 'emerging' },
  { id: 'ai', label: 'AI & AUTOMATION', group: 'emerging' },
  { id: 'robotics', label: 'ROBOTICS & SPATIAL', group: 'emerging' },
  { id: 'web3', label: 'BLOCKCHAIN & WEB3', group: 'emerging' },
  { id: 'quantum', label: 'QUANTUM & POST-QUANTUM', group: 'emerging' },
  { id: 'climate', label: 'CLIMATE & ENERGY', group: 'emerging' },
  { id: 'biotech', label: 'HEALTH & BIOTECH', group: 'emerging' },
  { id: 'fintech', label: 'FINTECH & COMMERCE', group: 'emerging' },
] as const

export const TECH_FIELD_LABELS: Record<string, string> = Object.fromEntries(
  TECH_FIELDS.map((field) => [field.id, field.label]),
)

export const TECH_FIELD_GROUPS = [
  {
    id: 'core',
    label: 'CORE SOFTWARE',
    fields: ['frontend', 'mobile', 'backend', 'data'],
  },
  {
    id: 'infrastructure',
    label: 'INFRASTRUCTURE & TRUST',
    fields: ['cloud', 'platform', 'reliability', 'security', 'identity'],
  },
  {
    id: 'emerging',
    label: 'EMERGING & INDUSTRY',
    fields: ['edge', 'ai', 'robotics', 'web3', 'quantum', 'climate', 'biotech', 'fintech'],
  },
] as const

export const BUZZWORD_DATA = {
  ceo: {
    adverbs: ['holistically', 'strategically', 'seamlessly', 'proactively', 'globally', 'inherently'],
    templates: [
      (phrase: string) => `Our goal is to ${phrase} to drive long-term value.`,
      (phrase: string) => `We must ${phrase} to stay ahead of the curve.`,
      (phrase: string) => `Fundamentally, it is about how we ${phrase}.`,
    ],
  },
  sales: {
    adverbs: ['aggressively', 'exponentially', 'frictionlessly', 'programmatically', 'intelligently', 'contextually'],
    templates: [
      (phrase: string) => `Use this strategy to ${phrase} and crush our growth targets.`,
      (phrase: string) => `This initiative helps us ${phrase} with zero friction.`,
      (phrase: string) => `Ideally, we ${phrase} to maximize wallet share.`,
    ],
  },
  tech: {
    adverbs: ['asynchronously', 'algorithmically', 'recursively', 'natively', 'autonomously', 'observably'],
    templates: [
      (phrase: string) => `We need to ${phrase} before the next sprint.`,
      (phrase: string) => `Basically, the platform will ${phrase} before the next release.`,
      (phrase: string) => `To reduce operational drag, we must ${phrase} immediately.`,
    ],
  },
} as const

export const TECH_FIELD_DATA = {
  frontend: {
    verbs: ['architect', 'ship', 'streamline', 'compose', 'modernize'],
    adjectives: ['accessible', 'server-rendered', 'edge-ready', 'component-led', 'performance-first'],
    nouns: ['web experiences', 'design systems', 'frontend platforms', 'release workflows', 'browser runtimes'],
  },
  mobile: {
    verbs: ['synchronize', 'replatform', 'activate', 'streamline', 'ship'],
    adjectives: ['offline-first', 'cross-platform', 'privacy-aware', 'device-native', 'low-friction'],
    nouns: ['mobile experiences', 'release pipelines', 'device integrations', 'app journeys', 'notification systems'],
  },
  backend: {
    verbs: ['orchestrate', 'decouple', 'harden', 'modernize', 'scale'],
    adjectives: ['event-driven', 'contract-first', 'low-latency', 'distributed', 'resilient'],
    nouns: ['API ecosystems', 'service boundaries', 'integration workflows', 'transaction systems', 'backend platforms'],
  },
  data: {
    verbs: ['govern', 'activate', 'federate', 'operationalize', 'reconcile'],
    adjectives: ['trusted', 'real-time', 'analytics-ready', 'domain-owned', 'privacy-aware'],
    nouns: ['data products', 'lakehouse workflows', 'streaming pipelines', 'semantic layers', 'database estates'],
  },
  cloud: {
    verbs: ['replatform', 'provision', 'rationalize', 'containerize', 'optimize'],
    adjectives: ['elastic', 'multi-cloud', 'policy-driven', 'cloud-native', 'cost-aware'],
    nouns: ['control planes', 'infrastructure estates', 'compute portfolios', 'deployment fabrics', 'cloud operating models'],
  },
  platform: {
    verbs: ['productize', 'standardize', 'pave', 'automate', 'enable'],
    adjectives: ['self-service', 'developer-first', 'golden-path', 'composable', 'governed'],
    nouns: ['engineering platforms', 'delivery workflows', 'developer portals', 'build systems', 'internal toolchains'],
  },
  reliability: {
    verbs: ['observe', 'stabilize', 'instrument', 'resilience-test', 'remediate'],
    adjectives: ['SLO-driven', 'failure-aware', 'traceable', 'capacity-ready', 'incident-ready'],
    nouns: ['service operations', 'reliability signals', 'production systems', 'response playbooks', 'telemetry estates'],
  },
  security: {
    verbs: ['harden', 'threat-model', 'isolate', 'secure', 'verify'],
    adjectives: ['zero-trust', 'supply-chain-aware', 'policy-as-code', 'adversary-resistant', 'security-first'],
    nouns: ['security controls', 'software supply chains', 'application perimeters', 'secrets workflows', 'defense layers'],
  },
  identity: {
    verbs: ['authenticate', 'consent-enable', 'decentralize', 'protect', 'modernize'],
    adjectives: ['passwordless', 'privacy-preserving', 'consent-led', 'identity-native', 'compliant'],
    nouns: ['identity journeys', 'passkey programs', 'consent systems', 'access policies', 'trust frameworks'],
  },
  edge: {
    verbs: ['distribute', 'connect', 'synchronize', 'deploy', 'instrument'],
    adjectives: ['edge-native', 'latency-sensitive', 'sensor-aware', 'connected', 'real-time'],
    nouns: ['device fleets', 'edge workloads', 'network fabrics', 'IoT operations', 'digital twin systems'],
  },
  ai: {
    verbs: ['orchestrate', 'evaluate', 'ground', 'govern', 'augment'],
    adjectives: ['agentic', 'human-in-the-loop', 'retrieval-aware', 'model-agnostic', 'audit-ready'],
    nouns: ['automation workflows', 'AI assistants', 'model evaluation systems', 'knowledge operations', 'decision loops'],
  },
  robotics: {
    verbs: ['simulate', 'coordinate', 'autonomize', 'spatialize', 'mobilize'],
    adjectives: ['physical-AI', 'robot-ready', 'spatially-aware', 'autonomous', 'simulation-led'],
    nouns: ['robot fleets', 'industrial operations', 'spatial interfaces', 'digital environments', 'autonomous workflows'],
  },
  web3: {
    verbs: ['tokenize', 'settle', 'decentralize', 'verify', 'custody-enable'],
    adjectives: ['on-chain', 'programmable', 'decentralized', 'wallet-native', 'trust-minimized'],
    nouns: ['asset rails', 'digital ownership models', 'smart contract workflows', 'token ecosystems', 'settlement networks'],
  },
  quantum: {
    verbs: ['migrate', 'quantize', 'future-proof', 'cryptographically-agilize', 'research-enable'],
    adjectives: ['post-quantum', 'quantum-ready', 'lattice-secured', 'cryptographically-agile', 'optimization-led'],
    nouns: ['security roadmaps', 'cryptographic migrations', 'quantum workflows', 'encryption estates', 'research programs'],
  },
  climate: {
    verbs: ['decarbonize', 'electrify', 'optimize', 'balance', 'measure'],
    adjectives: ['grid-aware', 'climate-resilient', 'carbon-intelligent', 'renewable-first', 'energy-efficient'],
    nouns: ['energy systems', 'decarbonization roadmaps', 'storage portfolios', 'climate data products', 'grid operations'],
  },
  biotech: {
    verbs: ['sequence', 'accelerate', 'personalize', 'automate', 'validate'],
    adjectives: ['bioinformatics-led', 'precision-ready', 'lab-automated', 'patient-centric', 'evidence-based'],
    nouns: ['clinical workflows', 'research pipelines', 'biological data products', 'lab operations', 'health platforms'],
  },
  fintech: {
    verbs: ['embed', 'settle', 'personalize', 'detect', 'reconcile'],
    adjectives: ['real-time', 'regulated', 'fraud-aware', 'embedded', 'open-banking-ready'],
    nouns: ['payment journeys', 'financial workflows', 'commerce platforms', 'risk operations', 'transaction ecosystems'],
  },
} as const
