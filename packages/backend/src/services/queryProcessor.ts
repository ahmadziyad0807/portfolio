import { Message, ConversationContext, KnowledgeEntry } from '@intelligenai/shared';
import { logger } from '../utils/logger';

export interface IntentClassificationResult {
  intent: 'faq' | 'troubleshooting' | 'onboarding' | 'product' | 'general';
  confidence: number;
  entities: ExtractedEntity[];
  keywords: string[];
}

export interface ExtractedEntity {
  type: 'product' | 'feature' | 'error' | 'step' | 'general';
  value: string;
  confidence: number;
}

export interface QueryAnalysisResult {
  classification: IntentClassificationResult;
  contextualInfo: {
    isFollowUp: boolean;
    previousIntent?: string;
    conversationStage: 'initial' | 'ongoing' | 'resolution';
  };
  suggestedKnowledgeEntries: KnowledgeEntry[];
}

export class QueryProcessor {
  private faqKeywords: Map<string, string[]> = new Map();
  private troubleshootingKeywords: Map<string, string[]> = new Map();
  private onboardingKeywords: Map<string, string[]> = new Map();
  private productKeywords: Map<string, string[]> = new Map();

  constructor() {
    this.initializeKeywordMaps();
  }

  /**
   * Analyze user query and classify intent
   */
  analyzeQuery(
    message: string, 
    context: ConversationContext,
    knowledgeBase: KnowledgeEntry[]
  ): QueryAnalysisResult {
    const startTime = Date.now();
    
    try {
      // Clean and normalize the message
      const normalizedMessage = this.normalizeMessage(message);
      
      // Extract entities from the message
      const entities = this.extractEntities(normalizedMessage);
      
      // Classify intent based on message content and context
      const classification = this.classifyIntent(normalizedMessage, context, entities);
      
      // Analyze conversational context
      const contextualInfo = this.analyzeConversationalContext(context);
      
      // Find relevant knowledge base entries
      const suggestedKnowledgeEntries = this.findRelevantKnowledgeEntries(
        normalizedMessage,
        classification.intent,
        entities,
        knowledgeBase
      );

      const processingTime = Date.now() - startTime;
      
      logger.info('Query analysis completed', {
        intent: classification.intent,
        confidence: classification.confidence,
        entitiesFound: entities.length,
        knowledgeEntriesFound: suggestedKnowledgeEntries.length,
        processingTime
      });

      return {
        classification,
        contextualInfo,
        suggestedKnowledgeEntries
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Query analysis failed', { error: errorMessage, message });
      
      // Return fallback result
      return {
        classification: {
          intent: 'general',
          confidence: 0.1,
          entities: [],
          keywords: []
        },
        contextualInfo: {
          isFollowUp: false,
          conversationStage: 'initial'
        },
        suggestedKnowledgeEntries: []
      };
    }
  }

  /**
   * Classify the intent of a message
   */
  private classifyIntent(
    message: string, 
    context: ConversationContext,
    entities: ExtractedEntity[]
  ): IntentClassificationResult {
    const scores = {
      faq: 0,
      troubleshooting: 0,
      onboarding: 0,
      product: 0,
      general: 0.1 // Base score for general intent
    };

    // Score based on keyword matching
    this.scoreByKeywords(message, scores);
    
    // Score based on entities
    this.scoreByEntities(entities, scores);
    
    // Score based on conversation context
    this.scoreByContext(context, scores);
    
    // Find the highest scoring intent
    const maxScore = Math.max(...Object.values(scores));
    const intent = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as IntentClassificationResult['intent'];
    
    // Extract keywords that contributed to the classification
    const keywords = this.extractRelevantKeywords(message, intent);
    
    return {
      intent,
      confidence: maxScore,
      entities,
      keywords
    };
  }

  /**
   * Extract entities from the message
   */
  private extractEntities(message: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const words = message.toLowerCase().split(/\s+/);

    // Product entity patterns
    const productPatterns = [
      /\b(api|dashboard|widget|chatbot|integration|service)\b/g,
      /\b(account|subscription|billing|payment)\b/g
    ];

    // Feature entity patterns
    const featurePatterns = [
      /\b(voice|speech|text|chat|conversation)\b/g,
      /\b(setup|configuration|settings|preferences)\b/g
    ];

    // Error entity patterns
    const errorPatterns = [
      /\b(error|bug|issue|problem|fail|broken)\b/g,
      /\b(not working|doesn't work|can't|unable)\b/g
    ];

    // Step entity patterns
    const stepPatterns = [
      /\b(step|next|first|second|third|final)\b/g,
      /\b(install|configure|setup|deploy)\b/g
    ];

    // Extract product entities
    productPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'product',
            value: match,
            confidence: 0.8
          });
        });
      }
    });

    // Extract feature entities
    featurePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'feature',
            value: match,
            confidence: 0.7
          });
        });
      }
    });

    // Extract error entities
    errorPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'error',
            value: match,
            confidence: 0.9
          });
        });
      }
    });

    // Extract step entities
    stepPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'step',
            value: match,
            confidence: 0.6
          });
        });
      }
    });

    // Remove duplicates and sort by confidence
    const uniqueEntities = entities.filter((entity, index, self) => 
      index === self.findIndex(e => e.type === entity.type && e.value === entity.value)
    );

    return uniqueEntities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find relevant knowledge base entries
   */
  private findRelevantKnowledgeEntries(
    message: string,
    intent: IntentClassificationResult['intent'],
    entities: ExtractedEntity[],
    knowledgeBase: KnowledgeEntry[]
  ): KnowledgeEntry[] {
    const relevantEntries: Array<{ entry: KnowledgeEntry; score: number }> = [];

    knowledgeBase.forEach(entry => {
      let score = 0;

      // Match by category
      if (entry.category === intent) {
        score += 0.5;
      }

      // Match by keywords
      const messageWords = message.toLowerCase().split(/\s+/);
      entry.keywords.forEach(keyword => {
        if (messageWords.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))) {
          score += 0.3;
        }
      });

      // Match by entities
      entities.forEach(entity => {
        if (entry.question.toLowerCase().includes(entity.value.toLowerCase()) ||
            entry.answer.toLowerCase().includes(entity.value.toLowerCase())) {
          score += 0.2 * entity.confidence;
        }
      });

      // Match by question similarity (simple word overlap)
      const questionWords = entry.question.toLowerCase().split(/\s+/);
      const overlap = messageWords.filter(word => questionWords.includes(word)).length;
      score += (overlap / Math.max(messageWords.length, questionWords.length)) * 0.4;

      if (score > 0.3) { // Threshold for relevance
        relevantEntries.push({ entry, score });
      }
    });

    // Sort by score and return top entries
    return relevantEntries
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.entry);
  }

  /**
   * Analyze conversational context
   */
  private analyzeConversationalContext(context: ConversationContext): QueryAnalysisResult['contextualInfo'] {
    const messages = context.messages || [];
    const recentMessages = messages.slice(-5); // Look at last 5 messages
    
    const isFollowUp = recentMessages.length > 1;
    const previousIntent = context.currentIntent;
    
    let conversationStage: 'initial' | 'ongoing' | 'resolution' = 'initial';
    
    if (messages.length === 0) {
      conversationStage = 'initial';
    } else if (messages.length < 6) {
      conversationStage = 'ongoing';
    } else {
      // Check if conversation seems to be resolving
      const lastAssistantMessage = recentMessages
        .filter(m => m.type === 'assistant')
        .pop();
      
      if (lastAssistantMessage?.content.toLowerCase().includes('help') ||
          lastAssistantMessage?.content.toLowerCase().includes('anything else')) {
        conversationStage = 'resolution';
      } else {
        conversationStage = 'ongoing';
      }
    }

    return {
      isFollowUp,
      previousIntent,
      conversationStage
    };
  }

  /**
   * Initialize keyword maps for different intents
   */
  private initializeKeywordMaps(): void {
    this.faqKeywords = new Map([
      ['general', ['what', 'how', 'why', 'when', 'where', 'faq', 'question', 'help']],
      ['pricing', ['cost', 'price', 'pricing', 'fee', 'charge', 'payment', 'billing']],
      ['features', ['feature', 'capability', 'function', 'can', 'does', 'support']],
      ['account', ['account', 'login', 'password', 'profile', 'user', 'register']]
    ]);

    this.troubleshootingKeywords = new Map([
      ['error', ['error', 'bug', 'issue', 'problem', 'broken', 'fail', 'crash']],
      ['not_working', ['not working', 'doesn\'t work', 'can\'t', 'unable', 'won\'t']],
      ['fix', ['fix', 'solve', 'resolve', 'repair', 'troubleshoot', 'debug']],
      ['performance', ['slow', 'lag', 'performance', 'speed', 'timeout', 'loading']]
    ]);

    this.onboardingKeywords = new Map([
      ['setup', ['setup', 'install', 'configure', 'initialize', 'start', 'begin']],
      ['guide', ['guide', 'tutorial', 'walkthrough', 'step', 'instruction']],
      ['getting_started', ['getting started', 'first time', 'new user', 'onboard']],
      ['deployment', ['deploy', 'deployment', 'production', 'launch', 'go live']]
    ]);

    this.productKeywords = new Map([
      ['information', ['about', 'information', 'details', 'spec', 'specification']],
      ['comparison', ['compare', 'vs', 'versus', 'difference', 'better', 'alternative']],
      ['availability', ['available', 'availability', 'when', 'release', 'launch']],
      ['integration', ['integrate', 'integration', 'api', 'embed', 'connect']]
    ]);
  }

  /**
   * Score intents based on keyword matching
   */
  private scoreByKeywords(message: string, scores: Record<string, number>): void {
    const lowerMessage = message.toLowerCase();

    // Score FAQ keywords
    this.faqKeywords.forEach((keywords) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          scores.faq += 0.2;
        }
      });
    });

    // Score troubleshooting keywords
    this.troubleshootingKeywords.forEach((keywords) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          scores.troubleshooting += 0.3;
        }
      });
    });

    // Score onboarding keywords
    this.onboardingKeywords.forEach((keywords) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          scores.onboarding += 0.25;
        }
      });
    });

    // Score product keywords
    this.productKeywords.forEach((keywords) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          scores.product += 0.2;
        }
      });
    });
  }

  /**
   * Score intents based on extracted entities
   */
  private scoreByEntities(entities: ExtractedEntity[], scores: Record<string, number>): void {
    entities.forEach(entity => {
      switch (entity.type) {
        case 'error':
          scores.troubleshooting += 0.4 * entity.confidence;
          break;
        case 'step':
          scores.onboarding += 0.3 * entity.confidence;
          break;
        case 'product':
          scores.product += 0.3 * entity.confidence;
          break;
        case 'feature':
          scores.faq += 0.2 * entity.confidence;
          scores.product += 0.2 * entity.confidence;
          break;
      }
    });
  }

  /**
   * Score intents based on conversation context
   */
  private scoreByContext(context: ConversationContext, scores: Record<string, number>): void {
    // Boost score for current intent if it exists
    if (context.currentIntent && scores[context.currentIntent] !== undefined) {
      scores[context.currentIntent] += 0.2;
    }

    // Boost onboarding if user is in onboarding flow
    if (context.onboardingStep !== undefined) {
      scores.onboarding += 0.3;
    }

    // Boost troubleshooting if user has troubleshooting state
    if (context.troubleshootingState?.currentIssue) {
      scores.troubleshooting += 0.3;
    }
  }

  /**
   * Extract keywords that contributed to intent classification
   */
  private extractRelevantKeywords(message: string, intent: IntentClassificationResult['intent']): string[] {
    const keywords: string[] = [];
    const lowerMessage = message.toLowerCase();

    let keywordMap: Map<string, string[]>;
    switch (intent) {
      case 'faq':
        keywordMap = this.faqKeywords;
        break;
      case 'troubleshooting':
        keywordMap = this.troubleshootingKeywords;
        break;
      case 'onboarding':
        keywordMap = this.onboardingKeywords;
        break;
      case 'product':
        keywordMap = this.productKeywords;
        break;
      default:
        return [];
    }

    keywordMap.forEach((keywordList) => {
      keywordList.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          keywords.push(keyword);
        }
      });
    });

    return Array.from(new Set(keywords)); // Remove duplicates
  }

  /**
   * Normalize message for processing
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
}

export const queryProcessor = new QueryProcessor();
