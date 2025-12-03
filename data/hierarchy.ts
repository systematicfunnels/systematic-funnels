
import { DocType, HierarchyNode } from '../types';

export const HIERARCHY_GROUPS = [
  "1. Strategy & Context",
  "2. Product Requirements",
  "3. Architecture & Design",
  "4. Implementation & Code",
  "5. Quality & Testing",
  "6. Operations & DevOps",
  "7. User & Customer Docs",
  "8. Business & GTM",
  "9. Process & Governance"
];

export const DOC_HIERARCHY: Record<string, HierarchyNode> = {
  // 1. Strategy
  [DocType.STRATEGY_VISION]: {
    id: DocType.STRATEGY_VISION,
    title: "1.1 Vision & Mission",
    category: "1. Strategy & Context",
    owner: "Founder / CPO",
    cta: "Approve Vision → Analyze Market",
    description: "Define the core north star, mission statement, and long-term goals.",
    nextDocs: [DocType.STRATEGY_MARKET]
  },
  [DocType.STRATEGY_MARKET]: {
    id: DocType.STRATEGY_MARKET,
    title: "1.2 Market & Problem Space",
    category: "1. Strategy & Context",
    owner: "Founder / Marketing",
    cta: "Lock Problem → Define Personas",
    description: "Analysis of the market landscape, competitor analysis, and core problem definition.",
    nextDocs: [DocType.STRATEGY_PERSONAS]
  },
  [DocType.STRATEGY_PERSONAS]: {
    id: DocType.STRATEGY_PERSONAS,
    title: "1.3 Personas & Use Cases",
    category: "1. Strategy & Context",
    owner: "PM / UX",
    cta: "Confirm Personas → Set KPIs",
    description: "Detailed user personas, empathy maps, and primary use cases.",
    nextDocs: [DocType.STRATEGY_KPI]
  },
  [DocType.STRATEGY_KPI]: {
    id: DocType.STRATEGY_KPI,
    title: "1.4 Success Metrics & KPIs",
    category: "1. Strategy & Context",
    owner: "Data Lead",
    cta: "Approve KPIs → Start Business Req",
    description: "Key Performance Indicators and success metrics for the product.",
    nextDocs: [DocType.PRODUCT_BRD]
  },

  // 2. Product
  [DocType.PRODUCT_BRD]: {
    id: DocType.PRODUCT_BRD,
    title: "2.1 Business Requirements (BRD)",
    category: "2. Product Requirements",
    owner: "Business Lead",
    cta: "Sign-off BRD → Generate PRD",
    description: "High-level business goals, scope, stakeholders, and financial constraints.",
    nextDocs: [DocType.PRODUCT_PRD, DocType.BIZ_GTM]
  },
  [DocType.PRODUCT_PRD]: {
    id: DocType.PRODUCT_PRD,
    title: "2.2 Product Requirements (PRD)",
    category: "2. Product Requirements",
    owner: "Product Manager",
    cta: "Sign-off PRD → Define User Stories",
    description: "Detailed functional requirements, features, and system behavior.",
    nextDocs: [DocType.PRODUCT_STORIES, DocType.ARCH_OVERVIEW]
  },
  [DocType.PRODUCT_STORIES]: {
    id: DocType.PRODUCT_STORIES,
    title: "2.3 Feature Specs & Stories",
    category: "2. Product Requirements",
    owner: "PM / Tech Lead",
    cta: "Freeze Stories → Estimation",
    description: "Detailed user stories with acceptance criteria and specific feature specs.",
    nextDocs: [DocType.PRODUCT_DOMAIN]
  },
  [DocType.PRODUCT_DOMAIN]: {
    id: DocType.PRODUCT_DOMAIN,
    title: "2.4 Domain Models & Glossary",
    category: "2. Product Requirements",
    owner: "PM / Architect",
    cta: "Approve Domain → Sync DB Design",
    description: "Definitions of core entities, domain language, and relationships.",
    nextDocs: []
  },

  // 3. Architecture
  [DocType.ARCH_OVERVIEW]: {
    id: DocType.ARCH_OVERVIEW,
    title: "3.1 System Architecture",
    category: "3. Architecture & Design",
    owner: "Solution Architect",
    cta: "Approve Arch → Detailed Design",
    description: "High-level system design, technology choices, and diagram descriptions.",
    nextDocs: [DocType.ARCH_COMPONENTS, DocType.ARCH_DB, DocType.ARCH_API]
  },
  [DocType.ARCH_COMPONENTS]: {
    id: DocType.ARCH_COMPONENTS,
    title: "3.2 Component Design",
    category: "3. Architecture & Design",
    owner: "Tech Lead",
    cta: "Finalize Map → Implementation",
    description: "Detailed breakdown of services, modules, and their interactions.",
    nextDocs: []
  },
  [DocType.ARCH_DB]: {
    id: DocType.ARCH_DB,
    title: "3.3 Database Design",
    category: "3. Architecture & Design",
    owner: "Data Engineer",
    cta: "Schema Approved → Migration Plan",
    description: "ER Diagrams, schema definitions, and indexing strategies.",
    nextDocs: []
  },
  [DocType.ARCH_API]: {
    id: DocType.ARCH_API,
    title: "3.4 Integration & API Design",
    category: "3. Architecture & Design",
    owner: "Backend Lead",
    cta: "API Spec Frozen → SDK Tasks",
    description: "REST/GraphQL API specifications, endpoints, and contracts.",
    nextDocs: []
  },
  [DocType.ARCH_UX]: {
    id: DocType.ARCH_UX,
    title: "3.5 UX / UI Design Guidelines",
    category: "3. Architecture & Design",
    owner: "Product Designer",
    cta: "Designs Approved → Frontend Build",
    description: "Design system, component library usage, and UX flows.",
    nextDocs: []
  },

  // 4. Code
  [DocType.CODE_OVERVIEW]: {
    id: DocType.CODE_OVERVIEW,
    title: "4.1 Codebase Overview",
    category: "4. Implementation & Code",
    owner: "Tech Lead",
    cta: "Repo Set → Onboard Devs",
    description: "Repository structure, key modules, and architectural patterns in code.",
    nextDocs: [DocType.CODE_STANDARDS]
  },
  [DocType.CODE_STANDARDS]: {
    id: DocType.CODE_STANDARDS,
    title: "4.2 Coding Standards",
    category: "4. Implementation & Code",
    owner: "Principal Engineer",
    cta: "Standards Agreed → Enforce",
    description: "Linting rules, style guides, and code review practices.",
    nextDocs: []
  },
  [DocType.CODE_SCAFFOLD]: {
    id: DocType.CODE_SCAFFOLD,
    title: "4.3 Code Scaffolding",
    category: "4. Implementation & Code",
    owner: "AI Generator",
    cta: "Review Code → Commit",
    description: "Auto-generated boilerplate code for the project.",
    nextDocs: []
  },
  [DocType.CODE_ENV]: {
    id: DocType.CODE_ENV,
    title: "4.4 Config & Environment",
    category: "4. Implementation & Code",
    owner: "DevOps",
    cta: "Config Doc'd → Deployment",
    description: "Environment variables, secrets management, and configuration guides.",
    nextDocs: []
  },

  // 5. Quality
  [DocType.TEST_STRATEGY]: {
    id: DocType.TEST_STRATEGY,
    title: "5.1 Test Strategy",
    category: "5. Quality & Testing",
    owner: "QA Lead",
    cta: "Strategy Approved → Test Plans",
    description: "Overall approach to testing, tools, and coverage goals.",
    nextDocs: [DocType.TEST_PLANS]
  },
  [DocType.TEST_PLANS]: {
    id: DocType.TEST_PLANS,
    title: "5.2 Test Plans",
    category: "5. Quality & Testing",
    owner: "QA Lead",
    cta: "Plans Reviewed → Cases",
    description: "Specific test plans for features and releases.",
    nextDocs: [DocType.TEST_CASES]
  },
  [DocType.TEST_CASES]: {
    id: DocType.TEST_CASES,
    title: "5.3 Test Cases & Suites",
    category: "5. Quality & Testing",
    owner: "SDET",
    cta: "Suites Ready → Pipeline",
    description: "Detailed test cases, scenarios, and automated suite definitions.",
    nextDocs: []
  },

  // 6. Ops
  [DocType.OPS_ENV]: {
    id: DocType.OPS_ENV,
    title: "6.1 Environment Mgmt",
    category: "6. Operations & DevOps",
    owner: "SRE",
    cta: "Envs Documented → Access",
    description: "Details on Dev, Staging, and Prod environments.",
    nextDocs: [DocType.OPS_CICD]
  },
  [DocType.OPS_CICD]: {
    id: DocType.OPS_CICD,
    title: "6.2 CI/CD Pipelines",
    category: "6. Operations & DevOps",
    owner: "Platform Eng",
    cta: "Pipelines Stable → Release",
    description: "Build, test, and deploy pipeline configurations.",
    nextDocs: [DocType.OPS_DEPLOY]
  },
  [DocType.OPS_DEPLOY]: {
    id: DocType.OPS_DEPLOY,
    title: "6.3 Deployment & Release",
    category: "6. Operations & DevOps",
    owner: "Release Manager",
    cta: "Release Executed → Notes",
    description: "Release procedures, rollback strategies, and deployment checklists.",
    nextDocs: [DocType.OPS_MONITORING]
  },
  [DocType.OPS_MONITORING]: {
    id: DocType.OPS_MONITORING,
    title: "6.4 Monitoring & Reliability",
    category: "6. Operations & DevOps",
    owner: "SRE",
    cta: "SLOs Defined → Alerts",
    description: "Observability setup, metrics, dashboards, and alert policies.",
    nextDocs: []
  },

  // 7. User Docs
  [DocType.USER_ONBOARDING]: {
    id: DocType.USER_ONBOARDING,
    title: "7.1 Onboarding & Quick Start",
    category: "7. User & Customer Docs",
    owner: "Docs Writer",
    cta: "Onboarding Live → In-Product",
    description: "Guides for new users to get started with the product.",
    nextDocs: [DocType.USER_GUIDES]
  },
  [DocType.USER_GUIDES]: {
    id: DocType.USER_GUIDES,
    title: "7.2 How-to Guides",
    category: "7. User & Customer Docs",
    owner: "Docs / PM",
    cta: "Guides Ready → Help Center",
    description: "Detailed feature guides and tutorials.",
    nextDocs: [DocType.USER_FAQ]
  },
  [DocType.USER_FAQ]: {
    id: DocType.USER_FAQ,
    title: "7.4 Troubleshooting & FAQ",
    category: "7. User & Customer Docs",
    owner: "Support Lead",
    cta: "FAQ Updated → Chatbot",
    description: "Common questions and troubleshooting steps.",
    nextDocs: []
  },

  // 8. Business
  [DocType.BIZ_PRICING]: {
    id: DocType.BIZ_PRICING,
    title: "8.1 Pricing & Packaging",
    category: "8. Business & GTM",
    owner: "Revenue Lead",
    cta: "Pricing Locked → Billing",
    description: "Pricing tiers, features per plan, and packaging strategy.",
    nextDocs: [DocType.BIZ_GTM]
  },
  [DocType.BIZ_GTM]: {
    id: DocType.BIZ_GTM,
    title: "8.2 GTM Strategy",
    category: "8. Business & GTM",
    owner: "PMM",
    cta: "GTM Agreed → Launch",
    description: "Marketing channels, sales strategy, and launch plan.",
    nextDocs: [DocType.BIZ_SALES]
  },
  [DocType.BIZ_SALES]: {
    id: DocType.BIZ_SALES,
    title: "8.3 Sales Enablement",
    category: "8. Business & GTM",
    owner: "Sales Lead",
    cta: "Playbooks Ready → Train",
    description: "Sales scripts, battle cards, and objection handling.",
    nextDocs: []
  },
  [DocType.BIZ_LEGAL]: {
    id: DocType.BIZ_LEGAL,
    title: "8.4 Legal & Compliance",
    category: "8. Business & GTM",
    owner: "Legal Counsel",
    cta: "Policies Signed → Publish",
    description: "Terms of Service, Privacy Policy, and compliance requirements.",
    nextDocs: []
  },

  // 9. Process
  [DocType.PROCESS_ROADMAP]: {
    id: DocType.PROCESS_ROADMAP,
    title: "9.1 Roadmaps & Planning",
    category: "9. Process & Governance",
    owner: "PM / Founder",
    cta: "Roadmap Aligned → Planning",
    description: "Strategic product roadmap and milestones.",
    nextDocs: [DocType.PROCESS_ADR]
  },
  [DocType.PROCESS_ADR]: {
    id: DocType.PROCESS_ADR,
    title: "9.3 Decisions (ADRs)",
    category: "9. Process & Governance",
    owner: "Tech Lead",
    cta: "ADR Logged → Review",
    description: "Architectural Decision Records and key technical choices.",
    nextDocs: []
  }
};
