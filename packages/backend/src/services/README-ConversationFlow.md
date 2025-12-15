# Conversation Flow Management

This document describes the conversation flow management system implemented for the LLM Chatbot.

## Overview

The conversation flow management system provides:

1. **Conversation History Preservation** - Maintains conversation history with intelligent memory optimization
2. **Onboarding Flow** - Step-by-step guidance for new users
3. **Troubleshooting Flow** - Structured problem-solving with escalation
4. **State Transitions** - Smooth transitions between different conversation modes
5. **Error Recovery** - Graceful handling of conversation errors

## Components

### ConversationFlowManager

The main service that orchestrates all conversation flows.

**Key Methods:**
- `preserveConversationHistory(sessionId)` - Optimizes memory usage for long conversations
- `initializeOnboardingFlow(sessionId, flowType)` - Starts onboarding process
- `progressOnboardingStep(sessionId)` - Moves to next onboarding step
- `initializeTroubleshootingFlow(sessionId, issue)` - Starts troubleshooting for an issue
- `progressTroubleshootingSolution(sessionId, solutionWorked)` - Tries next solution or completes
- `handleStateTransition(sessionId, fromState, toState)` - Manages conversation state changes
- `recoverFromError(sessionId, error)` - Recovers from conversation errors

### API Endpoints

**Conversation Flow Routes (`/api/conversation-flow`):**

- `POST /sessions/:sessionId/onboarding/start` - Start onboarding flow
- `POST /sessions/:sessionId/onboarding/next` - Progress onboarding step
- `POST /sessions/:sessionId/troubleshooting/start` - Start troubleshooting flow
- `POST /sessions/:sessionId/troubleshooting/next` - Progress troubleshooting solution
- `POST /sessions/:sessionId/state-transition` - Handle state transitions
- `POST /sessions/:sessionId/recover` - Recover from errors
- `POST /sessions/:sessionId/preserve-history` - Trigger memory optimization
- `GET /sessions/:sessionId/status` - Get current flow status

### Middleware

**ConversationFlowMiddleware** - Automatically detects conversation flow triggers in user messages:

- Detects onboarding requests ("help me get started", "setup", etc.)
- Detects troubleshooting requests ("problem", "not working", "error", etc.)
- Handles flow progression ("done", "next", "worked", "didn't work", etc.)

## Usage Examples

### Starting Onboarding Flow

```typescript
// Via API
POST /api/conversation-flow/sessions/session-id/onboarding/start
{
  "flowType": "general"
}

// Via Service
const onboardingFlow = await conversationFlowManager.initializeOnboardingFlow(sessionId, 'general');
```

### Starting Troubleshooting Flow

```typescript
// Via API
POST /api/conversation-flow/sessions/session-id/troubleshooting/start
{
  "issue": "Login not working"
}

// Via Service
const troubleshootingFlow = await conversationFlowManager.initializeTroubleshootingFlow(sessionId, 'Login not working');
```

### Automatic Flow Detection

The middleware automatically detects flow triggers in user messages:

```typescript
// User message: "I need help getting started"
// -> Automatically triggers onboarding flow

// User message: "I'm having a problem with login"
// -> Automatically triggers troubleshooting flow

// User message: "That worked, thanks!"
// -> Automatically marks troubleshooting solution as successful
```

## Flow States

### Onboarding Flow States

1. **Welcome** - Introduction and explanation
2. **Account Setup** - Account configuration
3. **Feature Overview** - Key features explanation
4. **First Task** - Guided task completion
5. **Completion** - Onboarding finished

### Troubleshooting Flow States

1. **Issue Identification** - Understanding the problem
2. **Solution Attempts** - Trying solutions in order of success rate
3. **Escalation** - When solutions don't work
4. **Resolution** - Problem solved or escalated to human support

### Conversation States

- `idle` - No active flow
- `onboarding` - User is in onboarding process
- `troubleshooting` - User is troubleshooting an issue
- `error_recovery` - Recovering from an error

## Memory Optimization

The system automatically optimizes memory usage when conversations exceed 50 messages:

1. **Keeps Recent Messages** - Last 20 messages are always preserved
2. **Preserves Important Messages** - System messages and flow-related messages
3. **Removes Redundant Messages** - Older casual conversation messages
4. **Maintains Context** - Ensures conversation context remains coherent

## Error Handling

The system provides comprehensive error handling:

1. **Automatic Recovery** - Attempts to recover from errors automatically
2. **State Reset** - Resets conversation to safe state on errors
3. **User Notification** - Informs users about errors gracefully
4. **Logging** - Comprehensive error logging for debugging

## Testing

The system includes comprehensive tests:

- **Unit Tests** - Test individual components and methods
- **Integration Tests** - Test complete flow scenarios
- **Error Scenarios** - Test error handling and recovery
- **Memory Optimization** - Test memory management

Run tests with:
```bash
npm test conversationFlowManager.test.ts
npm test conversationFlowIntegration.test.ts
```

## Configuration

The system uses configuration from session settings:

- `maxMessages` - Maximum messages before optimization (default: 50)
- `responseTimeout` - Timeout for responses (default: 5000ms)
- `currentIntent` - Current conversation intent
- `onboardingStep` - Current onboarding step
- `troubleshootingState` - Current troubleshooting state

## Future Enhancements

Potential improvements:

1. **Custom Flow Types** - Support for custom onboarding flows
2. **Dynamic Solutions** - AI-generated troubleshooting solutions
3. **Flow Analytics** - Track flow completion rates and effectiveness
4. **Multi-language Support** - Localized flows and messages
5. **Advanced Escalation** - Smart escalation based on user context