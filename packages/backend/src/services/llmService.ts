import { Message, ConversationContext, ChatRequest, ChatResponse, ResponseMetadata } from '@intelligenai/shared';
import { LLMEngine, LLMConfig } from './llmEngine';
import { ContextManager, ContextConfig } from './contextManager';
import { QueryProcessor, QueryAnalysisResult } from './queryProcessor';
import { KnowledgeBaseService } from './knowledgeBaseService';
import { ResponseGenerator } from './responseGenerator';
import { logger } from '../utils/logger';
import { generateId } from '../utils/uuid';

export interface LLMServiceConfig {
  llm: LLMConfig;
  context?: Partial<ContextConfig>;
  enableQueryProcessing?: boolean;
}

export class LLMService {
  private llmEngine: LLMEngine;
  private contextManager: ContextManager;
  private queryProcessor: QueryProcessor;
  private knowledgeBaseService: KnowledgeBaseService;
  private responseGenerator: ResponseGenerator;
  private enableQueryProcessing: boolean;

  constructor(config: LLMServiceConfig) {
    this.llmEngine = new LLMEngine(config.llm);
    this.contextManager = new ContextManager(config.context);
    this.queryProcessor = new QueryProcessor();
    this.knowledgeBaseService = new KnowledgeBaseService();
    this.responseGenerator = new ResponseGenerator();
    this.enableQueryProcessing = config.enableQueryProcessing ?? true;

    logger.info('LLM Service initialized with query processing', { 
      queryProcessingEnabled: this.enableQueryProcessing 
    });
  }

  /**
   * Initialize the LLM service by loading the model
   */
  async initialize(): Promise<void> {
    try {
      await this.llmEngine.loadModel();
      logger.info('LLM Service initialization completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to initialize LLM Service', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Process a chat request and generate a response
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // Validate request
      if (!request.message || request.message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Get or create conversation context
      let context = this.contextManager.getContext(request.sessionId);
      if (!context && request.context) {
        // Initialize context with provided data
        context = {
          messages: [],
          currentIntent: request.context.currentIntent,
          userPreferences: request.context.userPreferences,
          onboardingStep: request.context.onboardingStep,
          troubleshootingState: request.context.troubleshootingState
        };
      }

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        sessionId: request.sessionId,
        content: request.message.trim(),
        type: 'user',
        timestamp: new Date(),
        metadata: {
          processingTime: 0
        }
      };

      // Update context with user message
      context = this.contextManager.updateContext(request.sessionId, userMessage);

      let assistantMessage: Message;
      let suggestions: string[] = [];
      let responseMetadata: ResponseMetadata;

      if (this.enableQueryProcessing) {
        // Use query processing pipeline
        const result = await this.processWithQueryAnalysis(request.message, context);
        assistantMessage = {
          id: generateId(),
          sessionId: request.sessionId,
          content: result.content,
          type: 'assistant',
          timestamp: new Date(),
          metadata: {
            ...result.metadata,
            processingTime: Date.now() - startTime
          }
        };
        suggestions = result.suggestions;
        responseMetadata = result.metadata;
      } else {
        // Use traditional LLM-only processing
        const { response, metadata } = await this.llmEngine.generateResponse(
          request.message,
          context
        );

        assistantMessage = {
          id: generateId(),
          sessionId: request.sessionId,
          content: response,
          type: 'assistant',
          timestamp: new Date(),
          metadata: {
            ...metadata,
            processingTime: Date.now() - startTime
          }
        };

        suggestions = this.generateSuggestions(response, context);
        responseMetadata = {
          ...metadata,
          processingTime: Date.now() - startTime
        };
      }

      // Update context with assistant message
      this.contextManager.updateContext(request.sessionId, assistantMessage);

      // Update conversation intent if detected
      if (assistantMessage.metadata?.intent) {
        this.contextManager.updateContext(request.sessionId, assistantMessage);
        // Update the current intent separately
        const currentContext = this.contextManager.getContext(request.sessionId);
        if (currentContext) {
          currentContext.currentIntent = assistantMessage.metadata.intent;
        }
      }

      logger.info('Message processed successfully', {
        sessionId: request.sessionId,
        processingTime: Date.now() - startTime,
        responseLength: assistantMessage.content.length,
        intent: assistantMessage.metadata?.intent,
        queryProcessingUsed: this.enableQueryProcessing
      });

      return {
        message: assistantMessage,
        suggestions,
        metadata: responseMetadata
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorText = error instanceof Error ? error.message : String(error);
      logger.error('Failed to process message', {
        sessionId: request.sessionId,
        error: errorText,
        processingTime
      });

      // Create error response
      const errorMessage: Message = {
        id: generateId(),
        sessionId: request.sessionId,
        content: 'I apologize, but I encountered an error while processing your message. Please try again or rephrase your question.',
        type: 'assistant',
        timestamp: new Date(),
        metadata: {
          processingTime,
          confidence: 0,
          intent: 'error'
        }
      };

      const errorMetadata: ResponseMetadata = {
        processingTime,
        modelUsed: 'error-handler',
        confidence: 0,
        intent: 'error'
      };

      return {
        message: errorMessage,
        suggestions: ['Try rephrasing your question', 'Contact support if the issue persists'],
        metadata: errorMetadata
      };
    }
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string): Message[] {
    const context = this.contextManager.getContext(sessionId);
    return context?.messages || [];
  }

  /**
   * Clear conversation history for a session
   */
  clearConversationHistory(sessionId: string): void {
    this.contextManager.clearContext(sessionId);
    logger.info('Conversation history cleared', { sessionId });
  }

  /**
   * Update user preferences for a session
   */
  updateUserPreferences(
    sessionId: string, 
    preferences: Partial<ConversationContext['userPreferences']>
  ): void {
    this.contextManager.updateUserPreferences(sessionId, preferences);
  }

  /**
   * Update onboarding step for a session
   */
  updateOnboardingStep(sessionId: string, step: number): void {
    this.contextManager.updateOnboardingStep(sessionId, step);
  }

  /**
   * Update troubleshooting state for a session
   */
  updateTroubleshootingState(
    sessionId: string,
    state: Partial<ConversationContext['troubleshootingState']>
  ): void {
    this.contextManager.updateTroubleshootingState(sessionId, state);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    llmEngine: boolean;
    contextManager: boolean;
    modelInfo: { model: string; isLoaded: boolean };
    memoryStats: any;
  }> {
    const llmHealthy = await this.llmEngine.healthCheck();
    const modelInfo = this.llmEngine.getModelInfo();
    const memoryStats = this.contextManager.getMemoryStats();

    return {
      llmEngine: llmHealthy,
      contextManager: true, // Context manager is always healthy if instantiated
      modelInfo,
      memoryStats
    };
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    return await this.llmEngine.getAvailableModels();
  }

  /**
   * Cleanup expired contexts
   */
  cleanupExpiredContexts(): number {
    return this.contextManager.cleanupExpiredContexts();
  }

  /**
   * Process message using query analysis pipeline
   */
  private async processWithQueryAnalysis(
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    // Get knowledge base entries
    const knowledgeBase = this.knowledgeBaseService.getAllEntries();

    // Analyze the query
    const queryAnalysis = this.queryProcessor.analyzeQuery(message, context, knowledgeBase);

    // Handle different intents with specialized processing
    switch (queryAnalysis.classification.intent) {
      case 'faq':
        return this.handleFAQQuery(queryAnalysis, message, context);
      
      case 'troubleshooting':
        return this.handleTroubleshootingQuery(queryAnalysis, message, context);
      
      case 'onboarding':
        return this.handleOnboardingQuery(queryAnalysis, message, context);
      
      case 'product':
        return this.handleProductQuery(queryAnalysis, message, context);
      
      default:
        return this.handleGeneralQuery(queryAnalysis, message, context);
    }
  }

  /**
   * Handle FAQ queries using knowledge base
   */
  private async handleFAQQuery(
    queryAnalysis: QueryAnalysisResult,
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    if (queryAnalysis.suggestedKnowledgeEntries.length > 0) {
      // Use knowledge base response
      const response = this.responseGenerator.generateFAQResponse(
        queryAnalysis.suggestedKnowledgeEntries,
        message,
        context
      );
      
      return {
        content: response.content,
        metadata: response.metadata,
        suggestions: response.suggestions
      };
    } else {
      // Fall back to LLM with FAQ context
      return this.generateLLMResponseWithContext(message, context, 'faq');
    }
  }

  /**
   * Handle troubleshooting queries
   */
  private async handleTroubleshootingQuery(
    queryAnalysis: QueryAnalysisResult,
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    // Extract problem description from entities
    const problemEntities = queryAnalysis.classification.entities.filter(e => e.type === 'error');
    const problemDescription = problemEntities.length > 0 
      ? problemEntities[0].value 
      : message;

    // Generate solutions based on knowledge base and context
    const solutions = this.generateTroubleshootingSolutions(queryAnalysis, context);

    if (solutions.length > 0) {
      const response = this.responseGenerator.generateTroubleshootingResponse(
        solutions,
        problemDescription,
        context
      );

      // Update troubleshooting state
      this.contextManager.updateTroubleshootingState(context.messages[0]?.sessionId || '', {
        currentIssue: problemDescription,
        attemptedSolutions: solutions,
        escalationLevel: (context.troubleshootingState?.escalationLevel || 0) + 1
      });

      return {
        content: response.content,
        metadata: response.metadata,
        suggestions: response.suggestions
      };
    } else {
      // Fall back to LLM
      return this.generateLLMResponseWithContext(message, context, 'troubleshooting');
    }
  }

  /**
   * Handle onboarding queries
   */
  private async handleOnboardingQuery(
    queryAnalysis: QueryAnalysisResult,
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    const currentStep = context.onboardingStep || 1;
    const totalSteps = 5; // This would be configurable
    
    // Get step content from knowledge base or generate it
    const stepContent = this.getOnboardingStepContent(currentStep, queryAnalysis);

    const response = this.responseGenerator.generateOnboardingResponse(
      currentStep,
      totalSteps,
      stepContent,
      context
    );

    return {
      content: response.content,
      metadata: response.metadata,
      suggestions: response.suggestions
    };
  }

  /**
   * Handle product information queries
   */
  private async handleProductQuery(
    queryAnalysis: QueryAnalysisResult,
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    // Use knowledge base for product information
    if (queryAnalysis.suggestedKnowledgeEntries.length > 0) {
      const productEntries = queryAnalysis.suggestedKnowledgeEntries.filter(
        entry => entry.category === 'product'
      );

      if (productEntries.length > 0) {
        const response = this.responseGenerator.generateFAQResponse(
          productEntries,
          message,
          context
        );

        return {
          content: response.content,
          metadata: { ...response.metadata, intent: 'product' },
          suggestions: response.suggestions
        };
      }
    }

    // Fall back to LLM with product context
    return this.generateLLMResponseWithContext(message, context, 'product');
  }

  /**
   * Handle general queries using LLM
   */
  private async handleGeneralQuery(
    queryAnalysis: QueryAnalysisResult,
    message: string,
    context: ConversationContext
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    return this.generateLLMResponseWithContext(message, context, 'general');
  }

  /**
   * Generate LLM response with specific context
   */
  private async generateLLMResponseWithContext(
    message: string,
    context: ConversationContext,
    intent: string
  ): Promise<{ content: string; metadata: ResponseMetadata; suggestions: string[] }> {
    // Add intent-specific context to the prompt
    const contextualPrompt = this.addIntentContext(message, intent);
    
    const { response, metadata } = await this.llmEngine.generateResponse(
      contextualPrompt,
      context
    );

    const generatedResponse = this.responseGenerator.generateResponse(
      response,
      {
        classification: {
          intent: intent as any,
          confidence: 0.7,
          entities: [],
          keywords: []
        },
        contextualInfo: {
          isFollowUp: context.messages.length > 0,
          conversationStage: 'ongoing'
        },
        suggestedKnowledgeEntries: []
      },
      context
    );

    return {
      content: generatedResponse.content,
      metadata: {
        ...metadata,
        intent,
        confidence: 0.7
      },
      suggestions: generatedResponse.suggestions
    };
  }

  /**
   * Generate troubleshooting solutions
   */
  private generateTroubleshootingSolutions(
    queryAnalysis: QueryAnalysisResult,
    context: ConversationContext
  ): string[] {
    const solutions: string[] = [];
    
    // Get solutions from knowledge base
    const troubleshootingEntries = queryAnalysis.suggestedKnowledgeEntries.filter(
      entry => entry.category === 'troubleshooting'
    );

    troubleshootingEntries.forEach(entry => {
      // Extract solution steps from the answer
      const steps = entry.answer.split(/\d+\./);
      steps.forEach(step => {
        if (step.trim()) {
          solutions.push(step.trim());
        }
      });
    });

    // Add generic solutions if none found
    if (solutions.length === 0) {
      solutions.push(
        'Check your internet connection and refresh the page',
        'Clear your browser cache and cookies',
        'Try using a different browser or device',
        'Contact support if the issue persists'
      );
    }

    return solutions.slice(0, 5); // Limit to 5 solutions
  }

  /**
   * Get onboarding step content
   */
  private getOnboardingStepContent(
    step: number,
    queryAnalysis: QueryAnalysisResult
  ): string {
    // Get content from knowledge base or use default steps
    const onboardingEntries = queryAnalysis.suggestedKnowledgeEntries.filter(
      entry => entry.category === 'onboarding'
    );

    if (onboardingEntries.length > 0) {
      return onboardingEntries[0].answer;
    }

    // Default step content
    const defaultSteps = [
      'Welcome! Let\'s get you started with the chatbot system.',
      'First, let\'s configure your basic settings and preferences.',
      'Now, let\'s integrate the chatbot widget into your website.',
      'Let\'s test the chatbot functionality and voice features.',
      'Great! You\'re all set up. Here are some advanced features you can explore.'
    ];

    return defaultSteps[step - 1] || 'Let\'s continue with your setup.';
  }

  /**
   * Add intent-specific context to prompts
   */
  private addIntentContext(message: string, intent: string): string {
    const contextPrefixes = {
      faq: 'Please provide a helpful answer to this frequently asked question: ',
      troubleshooting: 'Help troubleshoot this technical issue with step-by-step guidance: ',
      onboarding: 'Provide onboarding guidance for this request: ',
      product: 'Provide detailed product information for this inquiry: ',
      general: 'Please provide a helpful response to: '
    };

    const prefix = contextPrefixes[intent as keyof typeof contextPrefixes] || contextPrefixes.general;
    return prefix + message;
  }

  /**
   * Get knowledge base service for external access
   */
  getKnowledgeBaseService(): KnowledgeBaseService {
    return this.knowledgeBaseService;
  }

  /**
   * Get query processor for external access
   */
  getQueryProcessor(): QueryProcessor {
    return this.queryProcessor;
  }

  /**
   * Get response generator for external access
   */
  getResponseGenerator(): ResponseGenerator {
    return this.responseGenerator;
  }

  /**
   * Generate conversation suggestions based on response and context
   */
  private generateSuggestions(response: string, context: ConversationContext): string[] {
    const suggestions: string[] = [];
    
    // Analyze response content to generate relevant suggestions
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('setup') || lowerResponse.includes('install')) {
      suggestions.push('How do I configure this?');
      suggestions.push('What are the system requirements?');
    } else if (lowerResponse.includes('error') || lowerResponse.includes('problem')) {
      suggestions.push('How can I troubleshoot this?');
      suggestions.push('What should I try next?');
    } else if (lowerResponse.includes('feature') || lowerResponse.includes('product')) {
      suggestions.push('Tell me more about this feature');
      suggestions.push('How much does this cost?');
    } else {
      // Default suggestions
      suggestions.push('Can you explain that differently?');
      suggestions.push('What else can you help me with?');
    }

    // Add context-specific suggestions
    if (context.onboardingStep !== undefined) {
      suggestions.push('What\'s the next step?');
    }

    if (context.troubleshootingState?.escalationLevel && context.troubleshootingState.escalationLevel > 0) {
      suggestions.push('Can I speak to a human?');
    }

    // Limit to 3 suggestions and ensure uniqueness
    return Array.from(new Set(suggestions)).slice(0, 3);
  }
}
