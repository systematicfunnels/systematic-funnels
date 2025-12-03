import { Template } from '../types';
import { Video, Users, ShoppingBag, PenTool } from 'lucide-react';

export const CREATOR_TEMPLATES: Template[] = [
  {
    id: 'onlyfans-alt',
    name: 'Subscription Content Platform',
    description: 'A platform for creators to share exclusive content with paying subscribers, similar to OnlyFans or Patreon.',
    category: 'Creator Platform',
    icon: Video,
    prefill: {
      name: 'My Creator Platform',
      concept: 'A premium content subscription platform for digital creators to monetize their fanbase directly.',
      problem: 'Creators rely on ad revenue which is unstable. They need a direct way to monetize their most loyal fans with exclusive content.',
      audience: 'Digital creators, influencers, artists, and their superfans.',
      features: [
        'Tiered subscription management',
        'Direct messaging with tip-to-unlock',
        'Secure video/image hosting',
        'Creator analytics dashboard',
        'Automated payouts via Stripe Connect'
      ],
      techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS S3'],
    }
  },
  {
    id: 'skool-clone',
    name: 'Community Learning Platform',
    description: 'A community-first course platform where creators can host courses and discussions in one place.',
    category: 'Community',
    icon: Users,
    prefill: {
      name: 'Community Hub',
      concept: 'An all-in-one platform combining courses, community forums, and event calendars.',
      problem: 'Course platforms lack community engagement, and community tools (Discord) lack course structure. Creators need both in one place.',
      audience: 'Educators, coaches, and community leaders.',
      features: [
        'Course curriculum builder',
        'Community discussion boards',
        'Gamification (Leaderboards & Levels)',
        'Live event scheduling',
        'Recurring membership billing'
      ],
      techStack: ['React', 'Firebase', 'Node.js'],
    }
  },
  {
    id: 'creator-marketplace',
    name: 'Service Marketplace',
    description: 'A marketplace connecting creators with brands or editors, similar to Fiverr or Collabstr.',
    category: 'Marketplace',
    icon: ShoppingBag,
    prefill: {
      name: 'Creator Gig Market',
      concept: 'A marketplace connecting brands with UGC (User Generated Content) creators for marketing campaigns.',
      problem: 'Brands struggle to find authentic creators for ads, and creators struggle to find consistent brand deals.',
      audience: 'UGC creators, marketing agencies, D2C brands.',
      features: [
        'Advanced search & filtering',
        'Escrow payment system',
        'Milestone-based project management',
        'Creator portfolio verification',
        'Review & rating system'
      ],
      techStack: ['Next.js', 'Django', 'PostgreSQL'],
    }
  },
  {
    id: 'creator-tools',
    name: 'AI Content Tool',
    description: 'SaaS tool for creators to edit, repurpose, or schedule content.',
    category: 'Tools',
    icon: PenTool,
    prefill: {
      name: 'AI Content Repurposer',
      concept: 'An AI tool that takes long-form video and automatically cuts it into shorts for TikTok/Reels.',
      problem: 'Editing short-form content from long videos is time-consuming and tedious for creators.',
      audience: 'YouTubers, Podcasters, Twitch Streamers.',
      features: [
        'AI highlight detection',
        'Auto-captioning',
        'Multi-platform publishing',
        'Brand template presets',
        'Cloud rendering'
      ],
      techStack: ['React', 'Python', 'FFmpeg', 'OpenAI API'],
    }
  }
];