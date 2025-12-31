
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  apiCredits: number;
}

export enum DocType {
  // 1. Strategy
  STRATEGY_VISION = 'strategy_vision',
  STRATEGY_MARKET = 'strategy_market',
  STRATEGY_PERSONAS = 'strategy_personas',
  STRATEGY_KPI = 'strategy_kpi',
  
  // 2. Product
  PRODUCT_BRD = 'product_brd',
  PRODUCT_PRD = 'product_prd',
  PRODUCT_STORIES = 'product_stories',
  PRODUCT_DOMAIN = 'product_domain',

  // 3. Architecture
  ARCH_OVERVIEW = 'arch_overview',
  ARCH_COMPONENTS = 'arch_components',
  ARCH_DB = 'arch_db',
  ARCH_API = 'arch_api',
  ARCH_UX = 'arch_ux',

  // 4. Implementation
  CODE_OVERVIEW = 'code_overview',
  CODE_STANDARDS = 'code_standards',
  CODE_SCAFFOLD = 'code_scaffold', 
  CODE_ENV = 'code_env',
  CODE_BACKEND = 'code_backend',
  CODE_FRONTEND = 'code_frontend',

  // 5. Quality
  TEST_STRATEGY = 'test_strategy',
  TEST_PLANS = 'test_plans',
  TEST_CASES = 'test_cases',
  
  // 6. Ops
  OPS_ENV = 'ops_env',
  OPS_CICD = 'ops_cicd',
  OPS_DEPLOY = 'ops_deploy',
  OPS_MONITORING = 'ops_monitoring',

  // 7. User Docs
  USER_ONBOARDING = 'user_onboarding',
  USER_GUIDES = 'user_guides',
  USER_FAQ = 'user_faq',
  USER_ADMIN = 'user_admin',

  // 8. Business
  BIZ_PRICING = 'biz_pricing',
  BIZ_GTM = 'biz_gtm',
  BIZ_SALES = 'biz_sales',
  BIZ_LEGAL = 'biz_legal',

  // 9. Process
  PROCESS_ROADMAP = 'process_roadmap',
  PROCESS_ADR = 'process_adr',
  
  // Legacy / Aliases (mapped for backward compatibility in generic logic)
  PRD = 'product_prd',
  BRD = 'product_brd',
  ARCHITECTURE = 'arch_overview',
  API_SPEC = 'arch_api',
  DB_SCHEMA = 'arch_db',
  ROADMAP = 'process_roadmap',
  GTM = 'biz_gtm',
  TEST_PLAN = 'test_plans',
  DEPLOYMENT = 'ops_deploy',
  USER_DOCS = 'user_guides',
  COMPETITOR_ANALYSIS = 'strategy_market',
  AUTH_SYSTEM = 'arch_components_auth', // special case
  BILLING_SYSTEM = 'biz_pricing_sys', // special case
  CI_CD_PIPELINE = 'ops_cicd',
  OBSERVABILITY_CONFIG = 'ops_monitoring'
}

export interface HierarchyNode {
  id: DocType;
  title: string;
  category: string;
  owner: string;
  cta: string;
  description: string;
  nextDocs?: DocType[];
}

export interface Document {
  id: string;
  type: DocType;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  lastUpdated: string;
  progress?: number; // 0-100
  phase?: string; // e.g. 'Analyzing', 'Drafting', 'Finalizing'
}

export interface Project {
  id: string;
  name: string;
  problem: string;
  audience: string;
  concept: string;
  features: string[];
  techStack: string[];
  budget: string;
  timeline: string;
  teamSize: number;
  status: 'new' | 'in_progress' | 'ready' | 'completed';
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  competitors?: string[];
}

export interface AIGenerationRequest {
  projectConcept: string;
  features: string[];
  targetAudience: string;
  problem: string;
  preferences: {
    tech: string[];
    budget: string;
    timeline: string;
  };
}

export interface WizardState {
  step: number;
  data: Partial<Project>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Creator Platform' | 'Community' | 'Marketplace' | 'Tools';
  icon: any;
  prefill: Partial<Project>;
}
