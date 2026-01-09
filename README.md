# ChaosLingua

**A language learning platform that embraces structured chaos and productive confusion**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://chaoslingua.adhdesigns.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🎯 Mission

ChaosLingua helps Romanian and Korean learners through **structured chaos** - an approach that embraces productive confusion, error harvesting, and exploratory learning. We provide the method; you provide the mess.

## 🚀 Core Features

### Learning Sessions
- **Chaos Window**: Timed free exploration with randomized content discovery
- **Deep Fog**: Immersion in above-level content to embrace confusion
- **The Forge**: Production practice (speaking, writing, creating)
- **Error Garden**: Review and tend to your harvested mistakes
- **Mystery Shelf**: Browse collected unknowns that resolve over time
- **Playlist Roulette**: Curated content journeys with randomization

### AI-Powered Grading System
Multi-agent orchestration for real-time feedback:
- **Context Agent**: Gathers user proficiency and learning history
- **Grading Agent**: Evaluates grammar, vocabulary, and naturalness
- **Feedback Agent**: Generates user-friendly corrections and suggestions
- **Proficiency Tracker**: Updates mastery patterns and error tracking
- **Audio Processor**: Speech-to-text and pronunciation scoring via AssemblyAI

### Language Support
- **Romanian (ro)**: Grammar focus on conjugations, case system, articles
- **Korean (ko)**: Particle mastery, honorifics, verb conjugations
- **Adaptive difficulty**: Content scales to user level (1-10)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: TailwindCSS, Radix UI, shadcn/ui components
- **Database**: Neon PostgreSQL with custom schema
- **AI**: Anthropic Claude API for grading and feedback
- **Audio**: AssemblyAI for speech processing
- **Auth**: Custom authentication with session management
- **Deployment**: Vercel with automatic sync from v0.app

### Database Schema
Comprehensive PostgreSQL schema with 15+ tables:
- User management (profiles, stats, settings)
- Content management (items, forge prompts)
- Learning tracking (sessions, errors, mysteries)
- Grading system (submissions, results, proficiency patterns)
- Audio processing (pronunciation phonemes)

### Component Structure
```
components/
├── auth/           # Authentication guards
├── chaos/          # Chaos session components
├── dashboard/      # Main dashboard UI
├── errors/         # Error garden interface
├── forge/          # Production practice modes
├── layout/         # App layout components
└── ui/             # Reusable UI components
```

## 🧠 Learning Philosophy

### Structured Chaos
- **Productive Confusion**: Learning happens at the edge of understanding
- **Error Harvesting**: Mistakes become curriculum through systematic review
- **Exploratory Learning**: Freedom to wander and make connections
- **Adaptive Difficulty**: Content challenges without overwhelming

### The Error Garden
Transform mistakes into growth:
- Automatic error capture from all sessions
- Pattern analysis and recurrence tracking
- Spaced repetition system for review
- Weekly progress reports

### Proficiency Tracking
Data-driven mastery assessment:
- Grammar pattern mastery levels
- Vocabulary production tracking
- Pronunciation phoneme accuracy
- Learning streak and habit formation

## 📊 API Endpoints

RESTful API with comprehensive coverage:
- `/api/auth/*` - Authentication and sessions
- `/api/content/*` - Learning content management
- `/api/grading/*` - AI grading system
- `/api/errors/*` - Error tracking and review
- `/api/sessions/*` - Learning session data
- `/api/user/*` - Profile and statistics

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Environment variables configured

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Add your database URL and API keys

# Run database migrations
psql $DATABASE_URL -f scripts/001-create-schema.sql

# Start development server
pnpm dev
```

### Environment Variables
```bash
DATABASE_URL=          # Neon PostgreSQL connection
ANTHROPIC_API_KEY=    # Claude API for AI grading
ASSEMBLYAI_API_KEY=   # Speech processing
NEXTAUTH_SECRET=      # Authentication secret
```

## 📈 ML & AI Features

### Grammar Rule Engine
- Hybrid AI + rule-based error detection
- 11+ curated grammar rules per language
- Pattern matching with severity scoring
- Difficulty-based filtering (1-10)

### Audio Processing
- Real-time speech-to-text transcription
- Pronunciation scoring with phoneme analysis
- Audio quality assessment
- Support for shadow-speak practice

### Pattern Analysis
- Error pattern recognition across sessions
- Weakness identification and targeted practice
- Progress tracking with confidence weighting
- Personalized learning recommendations

## 🎨 UI/UX Design

### Design System
- Dark-first theme with custom color palette
- Responsive design for mobile and desktop
- Accessibility-focused component library
- Smooth animations and micro-interactions

### Key Components
- Session cards with duration and difficulty
- Real-time grading results display
- Progress visualization with charts
- Error review interface with pattern highlighting

## 📚 Documentation

- [Grading System](docs/GRADING_SYSTEM.md) - Multi-agent AI grading architecture
- [Database Schema](scripts/001-create-schema.sql) - Complete database structure
- [API Documentation](app/api/) - Endpoint specifications
- [Component Library](components/) - Reusable UI components

## 🚀 Deployment

### Vercel Integration
- Automatic deployment from main branch
- Environment variable management
- Custom domain configuration
- Analytics integration

### Production Considerations
- Database connection pooling
- API rate limiting
- Error monitoring and logging
- Performance optimization

## 🔮 Future Roadmap

### Near Term
- Expanded grammar rule coverage
- Advanced pronunciation analysis
- Real-time grading with WebSockets
- Mobile app development

### Long Term
- Additional language support
- Custom grammar rule creation
- Community content sharing
- Advanced learning analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add TypeScript types for new components
- Update documentation for API changes
- Test grading system with sample inputs

## 📄 License

Part of ChaosLingua language learning platform.

---

**"We provide the method. You provide the mess."**
