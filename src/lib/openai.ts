import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function* enhanceWithAI(input: string) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that improves the clarity and structure of SaaS product ideas. Enhance the given text while maintaining its core meaning."
        },
        {
          role: "user",
          content: input
        }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      yield content;
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to OpenAI API');
  }
}

export async function* analyzeIdea(idea: string, currentAnalysis: string = '') {
  try {
    let quotedText = '';
    let originalContent = '';
    let beforeQuote = '';
    let afterQuote = '';
    let userPrompt = idea;
    
    if (idea.includes('Regarding this part:')) {
      const quoteMatch = idea.match(/Regarding this part: "([^"]+)"/);
      
      if (quoteMatch) {
        quotedText = quoteMatch[1];
        originalContent = currentAnalysis;
        
        // Find the quoted text in the original content and split around it
        const quoteIndex = originalContent.indexOf(quotedText);
        if (quoteIndex !== -1) {
          beforeQuote = originalContent.substring(0, quoteIndex);
          afterQuote = originalContent.substring(quoteIndex + quotedText.length);
          
          // Extract the actual question/prompt after the quote
          const afterQuoteMatch = idea.match(/Regarding this part: "[^"]+"\s*\n\n(.*)/s);
          if (afterQuoteMatch) {
            userPrompt = afterQuoteMatch[1];
          }
        }
      }
    }
    
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `You are a product strategy expert that helps analyze and break down SaaS product ideas. ${
            idea.includes('Regarding this part:')
              ? 'Focus on improving the specific section while maintaining the overall context and structure.'
              : 'Provide a structured analysis covering:\n1. Core Value Proposition\n2. Technical Feasibility\n3. Key Features\n4. Potential Challenges\n5. Development Roadmap'
          }`
        },
        {
          role: "user",
          content: idea.includes('Regarding this part:')
            ? `Original text: "${quotedText}"\n\nContext: This is part of a larger document. Please revise this specific section based on the following request:\n\n${userPrompt}`
            : userPrompt
        }
      ],
      stream: true,
    });

    let revisedText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';

      if (idea.includes('Regarding this part:') && quotedText) {
        revisedText += content;
        // When we have the complete revision, replace the quoted text
        if (chunk.choices[0]?.finish_reason === 'stop') {
          // Remove any "Revised text:" prefix if present
          const cleanedText = revisedText.replace(/^Revised text:\s*/i, '');
          const updatedContent = beforeQuote + cleanedText + afterQuote;
          yield updatedContent;
        }
      } else {
        // Remove any "Revised text:" prefix from the content
        const cleanedContent = content.replace(/^Revised text:\s*/i, '');
        revisedText += cleanedContent;
        yield cleanedContent;
      }
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to OpenAI API');
  }
}

export async function* generateDocument(idea: string, documentType: string) {
  const prompts = {
    'Idea': `You are a product strategy expert that helps analyze and break down SaaS product ideas. Provide a structured analysis covering:
1. Core Value Proposition
2. Technical Feasibility
3. Key Features
4. Potential Challenges
5. Development Roadmap

Be thorough but concise in your analysis.`,
    
    'Generate Front End Doc': `You are a senior front-end architect. Create a comprehensive front-end documentation for this product idea. Include:
1. Architecture Overview: Explain the high-level architecture and key design decisions
2. Technology Stack:
   - Vite for build tooling and development server
   - React with TypeScript for UI development
   - Tailwind CSS for styling
   - Lucide React for icons
   - Framer Motion for animations
3. Component Structure:
   - Component hierarchy and organization
   - Reusability patterns using React hooks
   - TypeScript types and interfaces
4. State Management:
   - React hooks for local state
   - Context API for global state when needed
   - TypeScript type safety considerations
5. UI/UX Implementation:
   - Tailwind CSS utility classes and custom configurations
   - Responsive design patterns
   - Animation strategies with Framer Motion
6. Performance Optimization:
   - Code splitting with React.lazy()
   - Vite-specific optimizations
   - Asset optimization guidelines
7. Testing Approach:
   - Vitest for unit and integration testing
   - React Testing Library best practices
8. Deployment:
   - Netlify deployment process
   - Environment variable management
   - Build optimization settings

Focus on Bolt.new's supported technologies and browser-based development environment.`,
    
    'Generate Back End Doc': `You are a senior back-end architect. Create a comprehensive back-end documentation for this product idea. Include:
1. System Architecture:
   - Browser-based Node.js runtime (WebContainer)
   - Limitations and constraints of the environment
   - Available system commands and capabilities
2. Database Implementation:
   - Supabase setup and configuration
   - Database schema design
   - Row Level Security (RLS) policies
   - TypeScript type generation
3. API Design:
   - RESTful endpoints using Supabase client
   - Request/response type definitions
   - Error handling patterns
4. Authentication & Authorization:
   - Supabase Auth implementation
   - Email/password authentication flow
   - RLS policy design
5. Data Access Patterns:
   - Supabase query optimization
   - Real-time subscriptions when needed
   - Batch operations and transactions
6. Security Implementation:
   - Environment variable management
   - API key security
   - Data validation strategies
7. Error Handling:
   - Error types and handling patterns
   - Logging in browser environment
   - User feedback mechanisms
8. Development Workflow:
   - Local development setup
   - Database migration strategy
   - Testing approach with available tools`,
    
    'Generate Implementation Flow': `You are a technical project manager. Create a detailed implementation flow for this product idea. Include:
1. Project Phases
2. Dependencies
3. Technical Requirements
4. Resource Allocation
5. Timeline Estimates
6. Risk Management
7. Milestones
8. Success Criteria
Please provide a practical, actionable implementation plan.`,
    
    'Generate PRD': `You are a senior CTO. Based on the following product idea:
{idea}

Please create a comprehensive PRD that is specifically designed for implementation in Bolt.new's browser-based development environment. The technical specifications must strictly adhere to Bolt.new's supported technologies and constraints.

Key Technical Constraints:
- Browser-based Node.js runtime (WebContainer)
- No native binaries or system-level access
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth (email/password only)
- Deployment: Netlify
- Available shell commands limited to basic operations
- No C/C++/Rust compilation
- No Git
- Python limited to standard library

Your response MUST follow this EXACT structure and include ALL sections with detailed subsections:

1. Project Goal
   - Clear, concise statement of the project's purpose
   - Core value proposition
   - Target audience

2. User Stories
   Core Features
   - Detailed user stories for main functionality
   - Format: "As a user, I want to [action] so that [benefit]"
   Premium Features
   - Premium-specific user stories
   - Monetization features
   Social Features
   - Social interaction stories
   - Community features

3. Requirements
   Functional Requirements
   - User Authentication & Profile
   - Core Feature Requirements
   - Premium Feature Requirements
   - Integration Requirements
   - Social Features
   Non-Functional Requirements
   - Performance metrics
   - Security requirements
   - Reliability standards
   - Compliance needs

4. Key Metrics
   User Engagement
   - Daily Active Users (DAU)
   - Feature usage metrics
   - Session duration
   Retention
   - 7-day retention rate
   - 30-day retention rate
   - Churn analysis
   Revenue
   - Monthly Recurring Revenue (MRR)
   - Customer Acquisition Cost (CAC)
   - Average Revenue Per User (ARPU)
   Performance
   - Technical performance KPIs
   - System reliability metrics
   - Error rates

5. Technical Architecture
   Frontend
   - React with TypeScript implementation
   - Vite build system configuration
   - Tailwind CSS styling approach
   - Component architecture
   - State management
   Backend
   - Supabase client implementation
   - PostgreSQL schema design
   - Row Level Security (RLS) policies
   - Supabase Auth integration
   Infrastructure
   - Netlify deployment configuration
   - Scaling strategy
   - Security measures

6. Development Roadmap
   Phase 1: MVP
   - Core feature implementation
   - Timeline and milestones
   Phase 2: Enhancement
   - Premium features
   - Social features
   Phase 3: Scale
   - Performance optimization
   - Advanced features

7. Risk Assessment
   Technical Risks
   - Implementation challenges
   - Performance concerns
   - Security vulnerabilities
   Business Risks
   - Market competition
   - User adoption
   - Revenue model
   Mitigation Strategies
   - Risk-specific action plans
   - Contingency measures

Please ensure each section is thoroughly detailed with specific examples and actionable items that can be implemented within Bolt.new's constraints. All technical recommendations must be compatible with the browser-based development environment.`,
    
    'Generate Development Guide': `You are a senior developer. Create a comprehensive development guide for this product idea. Include:
1. Setup Instructions
2. Coding Standards
3. Development Workflow
4. Version Control Strategy
5. Environment Setup
6. Debugging Guidelines
7. Performance Best Practices
8. Code Review Process
Please provide a practical, developer-friendly guide.`,
    
    'Generate Setup Guide': `You are a DevOps engineer. Create a comprehensive setup guide for this product idea. Include:
1. Environment Requirements
2. Installation Steps
3. Configuration Details
4. Dependencies Setup
5. Environment Variables
6. Troubleshooting Guide
7. Maintenance Procedures
8. Backup Strategies
Please provide a detailed, step-by-step setup guide.`,
    
    'Generate QA Guide': `You are a QA lead. Create a comprehensive QA guide for this product idea. Include:
1. Testing Strategy
2. Test Cases
3. Testing Tools
4. Test Environment Setup
5. Bug Reporting Process
6. Acceptance Criteria
7. Performance Testing
8. Security Testing
Please provide a detailed, practical QA guide.`,
    
    'Generate CI/CD Guide': `You are a DevOps engineer. Create a comprehensive CI/CD guide for this product idea. Include:
1. Pipeline Architecture
2. Build Process
3. Testing Strategy
4. Deployment Workflow
5. Environment Management
6. Monitoring Setup
7. Rollback Procedures
8. Security Measures
Please provide a detailed, implementation-ready CI/CD guide.`,
    
    'Generate UI Design Doc': `You are a UI/UX designer. Create a comprehensive UI design documentation for this product idea. Include:
1. Design System
2. Component Library
3. Layout Guidelines
4. Typography
5. Color Scheme
6. Responsive Design
7. Accessibility
8. Animation Guidelines
Please provide detailed, implementation-ready UI documentation.`,
    
    'Generate Tool Guide': `You are a technical architect. Create a comprehensive tool guide for this product idea. Include:
1. Development Tools
2. Testing Tools
3. Monitoring Tools
4. Deployment Tools
5. Documentation Tools
6. Collaboration Tools
7. Security Tools
8. Performance Tools
Please provide a detailed, practical tool guide.`
  };

  const systemPrompt = prompts[documentType];
  if (!systemPrompt) {
    throw new Error('Invalid document type');
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: idea
      }
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    yield content;
  }
}