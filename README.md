# StorAI - A Clinical AI Assistant (WIP)

A modern web application for managing and processing clinical sessions, featuring audio transcription, clinical summary generation, and EHR integration. This is a work in progress and is not yet ready for production.

## Architecture Overview

The application follows Clean Architecture principles with Domain-Driven Design (DDD), organized into the following layers:

### 1. Domain Layer (`src/domain/`)
- Contains the core business logic and interfaces
- Independent of external frameworks and services
- Key components:
  - `entities/`: Core business objects (ClinicalSession, ClinicalSummary)
  - `interfaces/`: Core service interfaces (TranscriptionService, LLMInterface)
  - `repositories/`: Data access interfaces
  - `validators/`: Data validation schemas

### 2. Application Layer (`src/application/`)
- Contains use cases and orchestration logic
- Implements business workflows
- Key components:
  - `use-cases/`: Business operations (GenerateClinicalSummary)
  - `services/`: Application services (SessionManager)

### 3. Infrastructure Layer (`src/infrastructure/`)
- Implements interfaces defined in the domain layer
- Handles external service integration
- Key components:
  - `transcription/`: Whisper API integration
  - `llm/`: OpenAI integration for summary generation
  - `ehr/`: EHR system integration
  - `db/`: Database implementations
  - `policy/`: Ethics policy implementations
  - `di-container.ts`: Dependency injection configuration

### 4. Presentation Layer (`src/presentation/ & app/`)
- Next.js application with API routes and React components
- Handles HTTP requests and UI rendering
- Key components:
  - `app/`: Next.js pages and API routes
  - `src/presentation/`: Reusable components and controllers

## Key Features

1. Audio Transcription
   - Supports multiple audio formats (mp3, m4a, wav, flac, ogg)
   - Uses OpenAI's Whisper API
   - Handles file uploads and processing

2. Clinical Summary Generation
   - AI-powered summary generation
   - Ethics policy validation
   - Integration with EHR systems

## Dependencies

- Node.js (v18.16.1)
- Next.js
- TypeScript
- InversifyJS (Dependency Injection)
- OpenAI API
- Form-data
- node-fetch

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   WHISPER_API_KEY=your_openai_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Contributing

### Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Follow the existing architecture:
   - Place business logic in appropriate layers
   - Use dependency injection
   - Implement interfaces for new services
   - Add necessary tests

3. Code Style Guidelines:
   - Use TypeScript
   - Follow SOLID principles
   - Document public APIs
   - Use meaningful variable/function names

4. Testing:
   - Write unit tests for domain logic
   - Write integration tests for infrastructure services
   - Test API endpoints

### Adding New Features

1. Domain Changes:
   - Add new entities in `src/domain/entities/`
   - Define interfaces in `src/domain/interfaces/`
   - Create validators in `src/domain/validators/`

2. Infrastructure Implementation:
   - Implement new interfaces in `src/infrastructure/`
   - Register services in `di-container.ts`
   - Add necessary environment variables

3. API Endpoints:
   - Create new routes in `app/api/`
   - Use dependency injection for services
   - Handle errors appropriately

4. UI Components:
   - Add new pages in `app/`
   - Create reusable components in `src/presentation/components/`

## Project Structure

```
├── app/                    # Next.js pages and API routes
│   ├── api/               # API endpoints
│   └── */                 # Page components
├── src/
│   ├── domain/           # Core business logic
│   ├── application/      # Use cases and services
│   ├── infrastructure/   # External service implementations
│   └── presentation/     # UI components and controllers
├── tests/                # Test files
└── package.json         # Project dependencies
```

## Environment Variables

Required environment variables:
- `WHISPER_API_KEY`: OpenAI API key for transcription
- `OPENAI_API_KEY`: OpenAI API key for summary generation

## Common Issues and Solutions

1. File Upload Issues:
   - Ensure correct file format
   - Check file size limits
   - Verify FormData structure

2. API Integration:
   - Verify API keys
   - Check request format
   - Monitor rate limits

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)