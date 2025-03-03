import { FileText, GitBranch, Layout, Database, Code, TestTube2, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DocumentConfig {
  icon: LucideIcon;
  title: string;
  displayName: string;
}

export const DOCUMENT_CONFIGS: Record<string, DocumentConfig> = {
  'Analysis': {
    icon: Sparkles,
    title: 'Analysis',
    displayName: 'Initial Analysis'
  },
  'Prompts': {
    icon: Code,
    title: 'Prompts',
    displayName: 'Development Prompts'
  },
  'PRD': {
    icon: FileText,
    title: 'PRD',
    displayName: 'Product Requirements'
  },
  'Implementation Flow': {
    icon: GitBranch,
    title: 'Implementation Flow',
    displayName: 'Implementation Flow'
  },
  'Front End': {
    icon: Layout,
    title: 'Front End',
    displayName: 'Frontend Documentation'
  },
  'Back End': {
    icon: Database,
    title: 'Back End',
    displayName: 'Backend Documentation'
  },
  'API Guide': {
    icon: Code,
    title: 'API Guide',
    displayName: 'API Documentation'
  },
  'QA': {
    icon: TestTube2,
    title: 'QA',
    displayName: 'Quality Assurance'
  }
};

export function getDocumentConfig(type: string | undefined): DocumentConfig {
  if (!type) {
    return {
      icon: Sparkles,
      title: 'Analysis',
      displayName: 'Analysis'
    };
  }

  const config = DOCUMENT_CONFIGS[type];
  if (config) {
    return config;
  }

  return {
    icon: Sparkles,
    title: type,
    displayName: type
  };
}