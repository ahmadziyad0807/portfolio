import { ResponseGenerator } from './responseGenerator';
import { ConversationContext, KnowledgeEntry, UserPreferences, TroubleshootingState } from '@intelligenai/shared';
import { QueryAnalysisResult, IntentClassificationResult } from './queryProcessor';

describe('ResponseGenerator', () => {
  let responseGenerator: ResponseGenerator;
  let mockContext: ConversationContext;
  let mockQueryAnalysis: QueryAnalysisResult;

  beforeEach(() => {
    responseGenerator = new ResponseGenerator();
    
    mockContext = {
      messages: [],
      currentIntent: 'general',
      userPreferences: {
        preferredResponseLength: 'medium',
        voiceEnabled: false,
        theme: 'light'
      }
    };

    mockQueryAnalysis = {
      classification: {
        intent: 'faq',
        confidence: 0.8,
        entities: [],
        keywords: ['help', 'question']
      },
      contextualInfo: {
        isFollowUp: false,
        conversationStage: 'initial'
      },
      suggestedKnowledgeEntries: []
    };
  });

  describe('generateResponse', () => {
    it('should generate a basic response with metadata', () => {
      const llmResponse = 'This is a test response from the LLM.';
      
      const result = responseGenerator.generateResponse(
        llmResponse,
        mockQueryAnalysis,
        mockContext
      );

      expect(result.content).toContain('This is a test response from the LLM.');
      expect(result.metadata).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.intent).toBe('faq');
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle personalization based on user preferences', () => {
      const llmResponse = 'This is a long response. It has multiple sentences. Each sentence provides detailed information. This should be truncated for short preference.';
      
      mockContext.userPreferences!.preferredResponseLength = 'short';
      
      const result = responseGenerator.generateResponse(
        llmResponse,
        mockQueryAnalysis,
        mockContext
      );

      expect(result.content.length).toBeLessThan(llmResponse.length);
    });

    it('should add contextual information for follow-up queries', () => {
      mockQueryAnalysis.contextualInfo.isFollowUp = true;
      mockQueryAnalysis.contextualInfo.previousIntent = 'troubleshooting';
      
      const result = responseGenerator.generateResponse(
        'Here is the follow-up information.',
        mockQueryAnalysis,
        mockContext
      );

      expect(result.content).toContain('Continuing with your troubleshooting issue:');
    });

    it('should return fallback response on error', () => {
      // Force an error by passing invalid data
      const invalidQueryAnalysis = null as any;
      
      const result = responseGenerator.generateResponse(
        'Test response',
        invalidQueryAnalysis,
        mockContext
      );

      expect(result.metadata.modelUsed).toBe('fallback');
      expect(result.metadata.confidence).toBe(0.1);
      expect(result.suggestions).toContain('Try rephrasing your question');
    });
  });

  describe('generateFAQResponse - Requirement 3.5', () => {
    it('should include relevant links and next steps for FAQ responses', () => {
      const knowledgeEntries: KnowledgeEntry[] = [
        {
          id: '1',
          category: 'faq',
          question: 'How do I get started?',
          answer: 'To get started, follow these steps...',
          keywords: ['start', 'begin', 'setup'],
          lastUpdated: new Date()
        }
      ];

      const result = responseGenerator.generateFAQResponse(
        knowledgeEntries,
        'How do I get started?',
        mockContext
      );

      // Requirement 3.5: Include relevant links or next steps where applicable
      expect(result.nextSteps).toBeDefined();
      expect(result.nextSteps!.length).toBeGreaterThan(0);
      expect(result.relatedLinks).toBeDefined();
      expect(result.relatedLinks!.length).toBeGreaterThan(0);
      
      // Check that links and next steps are included in content
      expect(result.content).toContain('Next Steps:');
      expect(result.content).toContain('Helpful Resources:');
      
      // Verify metadata includes the links and steps
      expect(result.metadata.nextSteps).toBeDefined();
      expect(result.metadata.relatedLinks).toBeDefined();
    });

    it('should handle multiple related FAQ entries', () => {
      const knowledgeEntries: KnowledgeEntry[] = [
        {
          id: '1',
          category: 'faq',
          question: 'How do I get started?',
          answer: 'To get started, follow these steps...',
          keywords: ['start', 'begin'],
          lastUpdated: new Date()
        },
        {
          id: '2',
          category: 'faq',
          question: 'What are the requirements?',
          answer: 'The requirements are...',
          keywords: ['requirements', 'needs'],
          lastUpdated: new Date()
        }
      ];

      const result = responseGenerator.generateFAQResponse(
        knowledgeEntries,
        'How do I get started?',
        mockContext
      );

      expect(result.content).toContain('Related Information:');
      expect(result.content).toContain('What are the requirements?');
    });

    it('should return no knowledge response when no entries found', () => {
      const result = responseGenerator.generateFAQResponse(
        [],
        'Unknown question',
        mockContext
      );

      expect(result.content).toContain('I don\'t have specific information');
      expect(result.metadata.confidence).toBe(0.3);
    });
  });

  describe('generateOnboardingResponse - Requirement 4.2', () => {
    it('should present information in clear, sequential format with progress indicators', () => {
      const result = responseGenerator.generateOnboardingResponse(
        2,
        5,
        'Configure your API settings by adding your key to the configuration file.',
        mockContext
      );

      // Requirement 4.2: Present information in clear, sequential format with progress indicators
      expect(result.content).toContain('Step 2 of 5');
      expect(result.content).toContain('Progress: 40% complete');
      expect(result.content).toMatch(/\[●\s●\s○\s○\s○\]/); // Progress bar
      
      // Check progress indicators in response object
      expect(result.progressIndicators).toBeDefined();
      expect(result.progressIndicators!.currentStep).toBe(2);
      expect(result.progressIndicators!.totalSteps).toBe(5);
      expect(result.progressIndicators!.completionPercentage).toBe(40);
      
      // Check for clear next steps
      expect(result.content).toContain('Next Steps:');
      expect(result.content).toContain('Complete the current step');
    });

    it('should show completion message for final step', () => {
      const result = responseGenerator.generateOnboardingResponse(
        5,
        5,
        'Final step: Test your configuration.',
        mockContext
      );

      expect(result.content).toContain('Congratulations!');
      expect(result.content).toContain('What you\'ve accomplished:');
      expect(result.content).toContain('Completed all 5 onboarding steps');
      expect(result.progressIndicators!.completionPercentage).toBe(100);
    });

    it('should include relevant onboarding links', () => {
      const result = responseGenerator.generateOnboardingResponse(
        1,
        3,
        'First step content',
        mockContext
      );

      expect(result.relatedLinks).toBeDefined();
      expect(result.relatedLinks!.some(link => link.title.includes('Onboarding'))).toBe(true);
      expect(result.relatedLinks!.some(link => link.title.includes('Requirements'))).toBe(true);
    });
  });

  describe('generateTroubleshootingResponse - Requirement 5.2', () => {
    it('should present solutions in order of likelihood and simplicity', () => {
      const solutions = [
        'Check your internet connection',
        'Restart the application',
        'Clear your browser cache and cookies',
        'Reinstall the software completely'
      ];

      const result = responseGenerator.generateTroubleshootingResponse(
        solutions,
        'Application not loading properly',
        mockContext
      );

      // Requirement 5.2: Present solutions in order of likelihood and simplicity
      expect(result.content).toContain('ordered by likelihood of success');
      expect(result.content).toContain('🟢 **Most Likely**');
      expect(result.content).toContain('🟡 **Alternative**');
      expect(result.content).toContain('🔵 **Additional Option**');
      
      // Check that solutions are numbered and formatted properly
      expect(result.content).toContain('**1.** 🟢 **Most Likely**');
      expect(result.content).toContain('Check your internet connection');
      
      // Check for clear instructions
      expect(result.content).toContain('Instructions:');
      expect(result.content).toContain('Try solutions in the order listed');
    });

    it('should include escalation information for repeated attempts', () => {
      const troubleshootingContext: ConversationContext = {
        ...mockContext,
        troubleshootingState: {
          currentIssue: 'Login problems',
          attemptedSolutions: ['solution1', 'solution2'],
          escalationLevel: 2
        }
      };

      const result = responseGenerator.generateTroubleshootingResponse(
        ['Try clearing cookies'],
        'Login problems',
        troubleshootingContext
      );

      expect(result.content).toContain('Need More Help?');
      expect(result.content).toContain('connect you with human support');
    });

    it('should include relevant troubleshooting links', () => {
      const result = responseGenerator.generateTroubleshootingResponse(
        ['Solution 1'],
        'API integration issue',
        mockContext
      );

      expect(result.relatedLinks).toBeDefined();
      expect(result.relatedLinks!.some(link => link.title.includes('Troubleshooting'))).toBe(true);
      expect(result.relatedLinks!.some(link => link.title.includes('API'))).toBe(true);
    });
  });

  describe('generateProductInfoResponse - Requirement 6.2', () => {
    it('should include relevant details such as pricing, availability, and specifications', () => {
      const productInfo = {
        name: 'Test Product',
        description: 'A comprehensive testing solution',
        pricing: {
          plans: [
            {
              name: 'Basic',
              price: '$9.99/month',
              features: ['Feature 1', 'Feature 2']
            },
            {
              name: 'Pro',
              price: '$19.99/month',
              features: ['All Basic features', 'Advanced analytics', 'Priority support']
            }
          ]
        },
        availability: {
          status: 'available' as const,
          releaseDate: '2024-01-15',
          regions: ['US', 'EU', 'Asia-Pacific']
        },
        specifications: {
          requirements: ['Node.js 16+', 'RAM: 4GB minimum'],
          compatibility: ['Windows', 'macOS', 'Linux'],
          performance: ['Response time: <100ms', 'Throughput: 1000 req/sec']
        }
      };

      const result = responseGenerator.generateProductInfoResponse(productInfo, mockContext);

      // Requirement 6.2: Include relevant details such as pricing, availability, and specifications
      expect(result.content).toContain('# Test Product');
      
      // Check pricing information
      expect(result.content).toContain('## 💰 Pricing');
      expect(result.content).toContain('**Basic** - $9.99/month');
      expect(result.content).toContain('**Pro** - $19.99/month');
      
      // Check availability information
      expect(result.content).toContain('## 📅 Availability');
      expect(result.content).toContain('✅ Available Now');
      expect(result.content).toContain('2024-01-15');
      expect(result.content).toContain('US, EU, Asia-Pacific');
      
      // Check specifications
      expect(result.content).toContain('## 🔧 Specifications');
      expect(result.content).toContain('System Requirements:');
      expect(result.content).toContain('Node.js 16+');
      expect(result.content).toContain('Compatibility:');
      expect(result.content).toContain('Windows');
      expect(result.content).toContain('Performance:');
      expect(result.content).toContain('Response time: <100ms');
    });

    it('should handle partial product information gracefully', () => {
      const minimalProductInfo = {
        name: 'Minimal Product',
        description: 'Basic product with limited info'
      };

      const result = responseGenerator.generateProductInfoResponse(minimalProductInfo, mockContext);

      expect(result.content).toContain('# Minimal Product');
      expect(result.content).toContain('Basic product with limited info');
      // Should not contain pricing/availability sections
      expect(result.content).not.toContain('## 💰 Pricing');
      expect(result.content).not.toContain('## 📅 Availability');
    });

    it('should format availability status correctly', () => {
      const productInfo = {
        name: 'Beta Product',
        description: 'Product in beta',
        availability: {
          status: 'beta' as const
        }
      };

      const result = responseGenerator.generateProductInfoResponse(productInfo, mockContext);

      expect(result.content).toContain('🧪 Beta Version');
    });
  });

  describe('Error Handling and Fallback Messaging', () => {
    it('should generate appropriate error responses for different error types', () => {
      const timeoutResponse = responseGenerator.generateErrorResponse('timeout');
      expect(timeoutResponse.content).toContain('Request Timeout');
      expect(timeoutResponse.content).toContain('Wait a moment and try again');

      const serviceResponse = responseGenerator.generateErrorResponse('service_unavailable');
      expect(serviceResponse.content).toContain('Service Temporarily Unavailable');
      expect(serviceResponse.content).toContain('technical difficulties');

      const rateLimitResponse = responseGenerator.generateErrorResponse('rate_limit');
      expect(rateLimitResponse.content).toContain('Rate Limit Reached');
      expect(rateLimitResponse.content).toContain('wait a moment');

      const invalidResponse = responseGenerator.generateErrorResponse('invalid_input', 'Invalid format');
      expect(invalidResponse.content).toContain('Invalid Input');
      expect(invalidResponse.content).toContain('Invalid format');
    });

    it('should provide helpful suggestions and next steps in error responses', () => {
      const errorResponse = responseGenerator.generateErrorResponse('unknown', 'Test error');

      expect(errorResponse.suggestions).toBeDefined();
      expect(errorResponse.suggestions.length).toBeGreaterThan(0);
      expect(errorResponse.nextSteps).toBeDefined();
      expect(errorResponse.nextSteps!.length).toBeGreaterThan(0);
      expect(errorResponse.relatedLinks).toBeDefined();
      expect(errorResponse.relatedLinks!.length).toBeGreaterThan(0);
    });
  });

  describe('Response Personalization and Context Injection', () => {
    it('should add personalized greeting for returning users', () => {
      const returningUserContext: ConversationContext = {
        ...mockContext,
        messages: new Array(12).fill(null).map((_, i) => ({
          id: `msg-${i}`,
          sessionId: 'session-1',
          content: `Message ${i}`,
          type: 'user' as const,
          timestamp: new Date()
        }))
      };

      returningUserContext.userPreferences!.preferredResponseLength = 'detailed';

      const result = responseGenerator.generateResponse(
        'Test response',
        mockQueryAnalysis,
        returningUserContext
      );

      expect(result.content).toContain('Welcome back!');
    });

    it('should add detailed context for users who prefer comprehensive responses', () => {
      mockContext.userPreferences!.preferredResponseLength = 'detailed';
      mockContext.currentIntent = 'troubleshooting';

      const result = responseGenerator.generateResponse(
        'Basic troubleshooting response',
        mockQueryAnalysis,
        mockContext
      );

      expect(result.content).toContain('Background Information:');
      expect(result.content).toContain('systematically identifying and resolving issues');
    });

    it('should inject context based on conversation state', () => {
      mockContext.onboardingStep = 3;
      mockQueryAnalysis.classification.intent = 'onboarding';

      const result = responseGenerator.generateResponse(
        'Onboarding help response',
        mockQueryAnalysis,
        mockContext
      );

      expect(result.content).toContain('step 3 of the onboarding process');
    });
  });

  describe('Metadata Inclusion', () => {
    it('should include comprehensive metadata in all responses', () => {
      const result = responseGenerator.generateResponse(
        'Test response',
        mockQueryAnalysis,
        mockContext
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.modelUsed).toBeDefined();
      expect(result.metadata.confidence).toBeGreaterThanOrEqual(0);
      expect(result.metadata.confidence).toBeLessThanOrEqual(1);
      expect(result.metadata.intent).toBeDefined();
    });

    it('should include next steps and related links in metadata when available', () => {
      const knowledgeEntries: KnowledgeEntry[] = [
        {
          id: '1',
          category: 'product',
          question: 'Product question',
          answer: 'Product answer',
          keywords: ['product'],
          lastUpdated: new Date()
        }
      ];

      const result = responseGenerator.generateFAQResponse(
        knowledgeEntries,
        'Product question',
        mockContext
      );

      expect(result.metadata.nextSteps).toBeDefined();
      expect(result.metadata.relatedLinks).toBeDefined();
      expect(result.metadata.nextSteps!.length).toBeGreaterThan(0);
      expect(result.metadata.relatedLinks!.length).toBeGreaterThan(0);
    });
  });
});
