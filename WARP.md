# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

**Kortix (Suna)** is an open-source platform for building, managing, and training AI agents. The flagship agent "Suna" demonstrates the platform's capabilities as a generalist AI worker that handles research, browser automation, file management, data analysis, and system operations.

## Architecture

### High-Level System Design

The platform consists of four main interconnected components:

1. **Backend API** (Python/FastAPI) - Agent orchestration, LLM integration, tool system, and REST endpoints
2. **Frontend Dashboard** (Next.js/React) - Agent management interface, chat UI, workflow builders, and monitoring
3. **Agent Runtime** (Docker) - Isolated execution environments with browser automation, code interpreter, and tool integration
4. **Database & Storage** (Supabase) - Authentication, agent configurations, conversation history, and real-time subscriptions

### Key Technical Patterns

- **Multi-Provider LLM**: Uses LiteLLM for unified access to Anthropic, OpenAI, Google Gemini, and OpenRouter
- **Tool System**: Dual-schema decorators (OpenAPI + XML) with consistent `ToolResult` responses
- **Agent Threading**: ThreadManager handles conversation context and tool execution chains
- **Background Processing**: Dramatiq workers for async agent execution and QStash for scheduled tasks
- **Security**: Supabase RLS policies, JWT validation, and Fernet encryption for credentials

## Common Development Commands

### Initial Setup
```bash
# Complete automated setup with wizard
python setup.py

# Start all services (after setup)
python start.py

# Alternative: Quick start with Docker
docker compose up -d --build
```

### Development Workflow

#### Backend Development
```bash
# Local backend development (with Docker Redis)
cd backend
docker compose up redis -d
uv run api.py                                    # API server
uv run dramatiq --processes 4 --threads 4 run_agent_background  # Background worker

# Run backend tests
cd backend
uv sync
uv run pytest

# Database migrations
cd backend
supabase db push                                 # Push migrations
```

#### Frontend Development  
```bash
# Frontend development
cd frontend
npm install
npm run dev                                      # Development server at :3000

# Frontend tests and linting
npm run test
npm run lint
npm run format
```

#### Full Stack Commands
```bash
# Docker-based development (recommended)
docker compose up -d --build                    # Start all services
docker compose down                              # Stop all services
docker compose logs -f backend                  # View backend logs
docker compose ps                               # Check service status

# Manual service startup (4 terminals required)
docker compose up redis -d                      # Infrastructure
cd frontend && npm run dev                      # Terminal 1
cd backend && uv run api.py                    # Terminal 2  
cd backend && uv run dramatiq run_agent_background  # Terminal 3
```

### Testing Commands
```bash
# Run specific test files
cd backend && uv run pytest tests/test_agents.py -v

# Test with coverage
cd backend && uv run pytest --cov=. --cov-report=html

# Frontend testing
cd frontend && npm run test:watch               # Watch mode
```

## Architecture Deep Dive

### Agent System Architecture

**Agent Versioning & Configuration**
- Agents support multiple versions stored in `agent_versions` table
- JSONB configuration storage with Pydantic validation
- Runtime tool registration via `AgentBuilderToolRegistry`
- Dynamic agent creation through `AgentBuilderInterface`

**Tool Execution Framework**
- Base classes: `AgentBuilderBaseTool` for platform tools, `Tool` for agent tools
- Dual schema pattern: `@openapi_schema()` decorator with XML fallback
- Consistent error handling with structured `ToolResult` responses
- External tool integration via `MCPToolWrapper` for MCP servers

**Thread Management**
- `ThreadManager` handles conversation context and message threading
- Supports both streaming and non-streaming responses
- Tool execution with timeout handling and narrative updates
- Background job integration for long-running tasks

### Database Schema Patterns

**Core Entities**
```sql
-- Key tables with UUID primary keys and RLS
agents (id, user_id, name, description, config)
agent_versions (id, agent_id, version, tools_config)
threads (id, user_id, agent_id, title)
messages (id, thread_id, role, content, metadata)
agent_workflows (id, user_id, name, config, trigger_config)
```

**Security Model**
- Row Level Security (RLS) on all user-accessible tables
- JWT token validation without signature verification (Supabase pattern)
- User claims extraction: `auth.uid()` for database policies
- Encrypted credential storage using Fernet symmetric encryption

### API Architecture

**FastAPI Patterns**
- Dependency injection for database connections (`get_db`)
- Authentication dependencies (`get_current_user`) 
- Modular route organization with `APIRouter`
- Pydantic v2 models for request/response validation
- Structured error responses with consistent HTTP status codes

**Key Endpoints**
```python
# Agent management
POST /api/agents                    # Create agent
GET /api/agents                     # List user agents  
PUT /api/agents/{id}                # Update agent
DELETE /api/agents/{id}             # Delete agent

# Agent execution
POST /api/agents/{id}/run           # Execute agent
GET /api/threads/{id}/messages      # Get conversation
POST /api/threads/{id}/messages     # Send message

# Tool management  
GET /api/tools                      # List available tools
POST /api/tools/validate            # Validate tool config
```

### Frontend Architecture

**Next.js App Router Structure**
```
frontend/src/
├── app/                  # Next.js app router pages
│   ├── (dashboard)/     # Dashboard layout group
│   ├── auth/           # Authentication pages  
│   └── api/            # API routes (if any)
├── components/         # Reusable React components
│   ├── ui/            # shadcn/ui components
│   ├── agents/        # Agent-specific components
│   └── chat/          # Chat interface components
├── hooks/             # Custom React hooks
├── lib/              # Utilities and configurations
├── providers/        # Context providers
└── types/           # TypeScript type definitions
```

**State Management Patterns**
- **Server State**: `@tanstack/react-query` for data fetching and caching
- **Local State**: React hooks (`useState`, `useReducer`) for component state  
- **Forms**: `react-hook-form` with `zod` validation and shadcn/ui form components
- **Real-time**: Supabase subscriptions for live updates

## Development Guidelines

### Backend Standards

**Python Code Quality**
- Python 3.11+ with comprehensive type hints
- Async/await for all I/O operations  
- Pydantic models for data validation
- Structured logging with `structlog`
- Error handling with custom exception classes

**Tool Development Pattern**
```python
class ExampleTool(AgentBuilderBaseTool):
    @openapi_schema({
        "type": "function",
        "function": {
            "name": "example_action", 
            "description": "Clear description of what this tool does",
            "parameters": {
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Parameter description"}
                },
                "required": ["param1"]
            }
        }
    })
    async def example_action(self, param1: str) -> ToolResult:
        try:
            result = await self.perform_action(param1)
            return self.success_response(result=result, message="Success message")
        except Exception as e:
            logger.error(f"Tool execution failed: {e}", exc_info=True)
            return self.fail_response(f"Failed: {str(e)}")
```

### Frontend Standards

**TypeScript & React Patterns**
- Strict TypeScript with no `any` types
- Component composition with proper prop typing
- Custom hooks for business logic abstraction
- Error boundaries for graceful error handling

**UI Development with shadcn/ui**
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Consistent component patterns following shadcn/ui conventions
const AgentForm = ({ onSubmit }: { onSubmit: (data: AgentData) => void }) => {
  const form = useForm({
    resolver: zodResolver(agentSchema),
  })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### Database Migration Patterns

**Idempotent Migration Structure**
```sql
BEGIN;

-- Create table with proper constraints
CREATE TABLE IF NOT EXISTS example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance  
CREATE INDEX IF NOT EXISTS idx_example_table_user_id ON example_table(user_id);

-- Enable RLS
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own records" ON example_table
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMIT;
```

## Key Configuration Files

### Environment Setup
- **`mise.toml`**: Tool version management (Node.js 18+, Python 3.11+, Docker)
- **`backend/.env`**: API keys, database URLs, Redis config, encryption keys
- **`frontend/.env.local`**: Supabase config, backend URL, environment mode
- **`docker-compose.yaml`**: Full development stack with Redis, backend, frontend

### Package Management
- **`backend/pyproject.toml`**: Python dependencies with uv package manager
- **`frontend/package.json`**: Node.js dependencies with npm
- **`sdk/pyproject.toml`**: Python SDK for external integrations

## External Integration Requirements

### Required Services
- **Supabase**: Database, authentication, real-time subscriptions
- **LLM Provider**: At least one of Anthropic, OpenAI, OpenRouter, or Google Gemini
- **Daytona**: Agent execution sandboxing (requires snapshot: `kortix/suna:0.1.3.12`)
- **Tavily**: Web search capabilities  
- **Firecrawl**: Web scraping and content extraction

### Optional Services
- **RapidAPI**: Extended tool integrations (LinkedIn scraping, etc.)
- **Morph**: AI-powered code editing (fallback to OpenRouter)
- **Composio**: Workflow automation and external tool integrations
- **QStash**: Background job scheduling
- **Sentry**: Error tracking and monitoring
- **Langfuse**: LLM call tracing and observability

## Important Cursor Rules Integration

The codebase includes comprehensive Cursor rules that should be followed:

- **Backend**: Python 3.11+ patterns, FastAPI architecture, tool development framework, Supabase integration
- **Frontend**: Next.js App Router, TypeScript standards, shadcn/ui components, React Query patterns  
- **Infrastructure**: Docker best practices, deployment strategies, monitoring, security configurations
- **Project**: Overall architecture principles, development workflow, testing strategies

Refer to `.cursor/rules/*.mdc` files for detailed domain-specific guidance on coding patterns, architectural decisions, and best practices.

## Troubleshooting

### Common Issues

**Agent Execution Failures**
- Verify Daytona snapshot exists: `kortix/suna:0.1.3.12`
- Check agent configuration schema validation
- Review tool execution timeout settings

**Database Connection Issues**  
- Confirm Supabase project URL and keys are correct
- Verify RLS policies allow user access
- Check if required database extensions are enabled

**Development Environment**
- Ensure Docker is running for Redis and agent runtime
- Verify all required environment variables are set
- Check that ports 3000, 6379, and 8000 are available

Use `python setup.py` to reconfigure services or `python start.py --help` for startup options.
