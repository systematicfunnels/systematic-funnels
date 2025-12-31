
# Systematic Funnels

**Systematic Funnels** is an AI-powered documentation generation platform designed to transform a project concept into a comprehensive, structured suite of technical and business documentation. By leveraging the latest in Generative AI, it helps founders, product managers, and engineers bridge the gap from idea to execution with a systematic, hierarchical approach.

## 🚀 Key Features

- **Hierarchical Documentation**: Automatically generates documents across 9 core categories:
  - **Strategy & Context**: Vision, Market Analysis, Personas, KPIs.
  - **Product Requirements**: BRDs, PRDs, User Stories, Domain Models.
  - **Architecture & Design**: System Architecture, Component Design, DB Schema, API Specs.
  - **Implementation & Code**: Codebase Overview, Standards, Scaffolding.
  - **Quality & Testing**: Test Strategy, Plans, and Cases.
  - **Operations & DevOps**: Environment Management, CI/CD, Deployment, Monitoring.
  - **User & Customer Docs**: Onboarding, How-to Guides, FAQs.
  - **Business & GTM**: Pricing, GTM Strategy, Sales Enablement, Legal.
  - **Process & Governance**: Roadmaps, ADRs.
- **AI-Powered Generation**: Integrated with **Google Gemini (Flash & Pro)**, utilizing advanced features like Grounded Search for market research and Thinking Modes for complex architectural design.
- **Progressive Workflow**: A smart generation strategy that prioritizes core strategy and product requirements before moving into technical implementation details.
- **Project Templates**: Start instantly with pre-configured templates for Marketplaces, Creator Platforms, Communities, and more.
- **Secure Authentication**: Built-in user management via **Supabase**, including multi-factor authentication (MFA) and secure session management.
- **Interactive Workspace**: View, edit, and regenerate documents in a modern, responsive dashboard.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: React Hooks & Context API
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **AI Integration**: [Google Generative AI SDK](https://github.com/google/generative-ai-js)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Tailwind CSS

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A [Supabase Project](https://supabase.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/systematic-funnels.git
   cd systematic-funnels
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to start using Systematic Funnels.

## 📂 Project Structure

- `/api`: Service layers for AI and Supabase integrations.
- `/components`: Reusable UI components including the Document Viewer and Project Wizard.
- `/pages`: Main application views (Dashboard, Projects, Settings, etc.).
- `/data`: Static definitions for document hierarchy and templates.
- `/prisma`: Database schema and configuration.
- `/types.ts`: Centralized TypeScript interfaces and enums.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by the Systematic Funnels Team.
