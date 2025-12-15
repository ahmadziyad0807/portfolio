import { KnowledgeEntry } from '@intelligenai/shared';
import { logger } from '../utils/logger';
import { generateId } from '../utils/uuid';

export interface KnowledgeBaseConfig {
  autoUpdate: boolean;
  cacheTimeout: number; // in milliseconds
}

export interface SearchOptions {
  category?: KnowledgeEntry['category'];
  limit?: number;
  minScore?: number;
}

export interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string[];
}

export class KnowledgeBaseService {
  private knowledgeEntries: Map<string, KnowledgeEntry>;
  private categoryIndex: Map<KnowledgeEntry['category'], Set<string>>;
  private keywordIndex: Map<string, Set<string>>;
  private config: KnowledgeBaseConfig;
  private lastUpdated: Date;

  constructor(config: Partial<KnowledgeBaseConfig> = {}) {
    this.knowledgeEntries = new Map();
    this.categoryIndex = new Map();
    this.keywordIndex = new Map();
    this.config = {
      autoUpdate: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...config
    };
    this.lastUpdated = new Date();
    
    this.initializeDefaultKnowledge();
    logger.info('Knowledge Base Service initialized');
  }

  /**
   * Add a new knowledge entry
   */
  addEntry(entry: Omit<KnowledgeEntry, 'id' | 'lastUpdated'>): KnowledgeEntry {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: generateId(),
      lastUpdated: new Date()
    };

    this.knowledgeEntries.set(newEntry.id, newEntry);
    this.updateIndexes(newEntry);
    this.lastUpdated = new Date();

    logger.info('Knowledge entry added', { 
      id: newEntry.id, 
      category: newEntry.category,
      keywordCount: newEntry.keywords.length 
    });

    return newEntry;
  }

  /**
   * Update an existing knowledge entry
   */
  updateEntry(id: string, updates: Partial<Omit<KnowledgeEntry, 'id'>>): KnowledgeEntry | null {
    const existingEntry = this.knowledgeEntries.get(id);
    if (!existingEntry) {
      return null;
    }

    // Remove from old indexes
    this.removeFromIndexes(existingEntry);

    // Update entry
    const updatedEntry: KnowledgeEntry = {
      ...existingEntry,
      ...updates,
      lastUpdated: new Date()
    };

    this.knowledgeEntries.set(id, updatedEntry);
    this.updateIndexes(updatedEntry);
    this.lastUpdated = new Date();

    logger.info('Knowledge entry updated', { id, category: updatedEntry.category });

    return updatedEntry;
  }

  /**
   * Delete a knowledge entry
   */
  deleteEntry(id: string): boolean {
    const entry = this.knowledgeEntries.get(id);
    if (!entry) {
      return false;
    }

    this.removeFromIndexes(entry);
    this.knowledgeEntries.delete(id);
    this.lastUpdated = new Date();

    logger.info('Knowledge entry deleted', { id, category: entry.category });

    return true;
  }

  /**
   * Get a knowledge entry by ID
   */
  getEntry(id: string): KnowledgeEntry | null {
    return this.knowledgeEntries.get(id) || null;
  }

  /**
   * Get all knowledge entries
   */
  getAllEntries(): KnowledgeEntry[] {
    return Array.from(this.knowledgeEntries.values());
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
    const entryIds = this.categoryIndex.get(category) || new Set();
    return Array.from(entryIds)
      .map(id => this.knowledgeEntries.get(id))
      .filter((entry): entry is KnowledgeEntry => entry !== undefined);
  }

  /**
   * Search knowledge base
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const {
      category,
      limit = 10,
      minScore = 0.1
    } = options;

    const results: SearchResult[] = [];
    const queryWords = this.normalizeText(query).split(/\s+/);

    // Get entries to search
    let entriesToSearch: KnowledgeEntry[];
    if (category) {
      entriesToSearch = this.getEntriesByCategory(category);
    } else {
      entriesToSearch = this.getAllEntries();
    }

    // Score each entry
    entriesToSearch.forEach(entry => {
      const result = this.scoreEntry(entry, queryWords);
      if (result.score >= minScore) {
        results.push(result);
      }
    });

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Find entries by keywords
   */
  findByKeywords(keywords: string[]): KnowledgeEntry[] {
    const entryIds = new Set<string>();

    keywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      const matchingIds = this.keywordIndex.get(normalizedKeyword) || new Set();
      matchingIds.forEach(id => entryIds.add(id));
    });

    return Array.from(entryIds)
      .map(id => this.knowledgeEntries.get(id))
      .filter((entry): entry is KnowledgeEntry => entry !== undefined);
  }

  /**
   * Get knowledge base statistics
   */
  getStats() {
    const categoryStats = new Map<KnowledgeEntry['category'], number>();
    
    this.knowledgeEntries.forEach(entry => {
      const count = categoryStats.get(entry.category) || 0;
      categoryStats.set(entry.category, count + 1);
    });

    return {
      totalEntries: this.knowledgeEntries.size,
      categoryCounts: Object.fromEntries(categoryStats),
      totalKeywords: this.keywordIndex.size,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Bulk import knowledge entries
   */
  bulkImport(entries: Array<Omit<KnowledgeEntry, 'id' | 'lastUpdated'>>): KnowledgeEntry[] {
    const importedEntries: KnowledgeEntry[] = [];

    entries.forEach(entryData => {
      try {
        const entry = this.addEntry(entryData);
        importedEntries.push(entry);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to import knowledge entry', { 
          error: errorMessage, 
          question: entryData.question 
        });
      }
    });

    logger.info('Bulk import completed', { 
      imported: importedEntries.length, 
      failed: entries.length - importedEntries.length 
    });

    return importedEntries;
  }

  /**
   * Export knowledge base
   */
  export(): KnowledgeEntry[] {
    return this.getAllEntries();
  }

  /**
   * Clear all knowledge entries
   */
  clear(): void {
    this.knowledgeEntries.clear();
    this.categoryIndex.clear();
    this.keywordIndex.clear();
    this.lastUpdated = new Date();
    
    logger.info('Knowledge base cleared');
  }

  /**
   * Score a knowledge entry against query words
   */
  private scoreEntry(entry: KnowledgeEntry, queryWords: string[]): SearchResult {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Normalize entry text
    const questionWords = this.normalizeText(entry.question).split(/\s+/);
    const answerWords = this.normalizeText(entry.answer).split(/\s+/);
    const entryKeywords = entry.keywords.map(k => this.normalizeText(k));

    // Score based on question match
    queryWords.forEach(queryWord => {
      // Exact match in question (highest score)
      if (questionWords.includes(queryWord)) {
        score += 0.5;
        matchedKeywords.push(queryWord);
      }
      
      // Partial match in question
      else if (questionWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
        score += 0.3;
        matchedKeywords.push(queryWord);
      }
      
      // Match in answer
      else if (answerWords.includes(queryWord)) {
        score += 0.2;
        matchedKeywords.push(queryWord);
      }
      
      // Match in keywords
      else if (entryKeywords.includes(queryWord)) {
        score += 0.4;
        matchedKeywords.push(queryWord);
      }
      
      // Partial match in keywords
      else if (entryKeywords.some(keyword => keyword.includes(queryWord) || queryWord.includes(keyword))) {
        score += 0.25;
        matchedKeywords.push(queryWord);
      }
    });

    // Boost score based on keyword density
    const keywordDensity = matchedKeywords.length / queryWords.length;
    score *= (0.5 + keywordDensity);

    return {
      entry,
      score,
      matchedKeywords: Array.from(new Set(matchedKeywords))
    };
  }

  /**
   * Update indexes for a knowledge entry
   */
  private updateIndexes(entry: KnowledgeEntry): void {
    // Update category index
    if (!this.categoryIndex.has(entry.category)) {
      this.categoryIndex.set(entry.category, new Set());
    }
    this.categoryIndex.get(entry.category)!.add(entry.id);

    // Update keyword index
    entry.keywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      if (!this.keywordIndex.has(normalizedKeyword)) {
        this.keywordIndex.set(normalizedKeyword, new Set());
      }
      this.keywordIndex.get(normalizedKeyword)!.add(entry.id);
    });
  }

  /**
   * Remove entry from indexes
   */
  private removeFromIndexes(entry: KnowledgeEntry): void {
    // Remove from category index
    const categorySet = this.categoryIndex.get(entry.category);
    if (categorySet) {
      categorySet.delete(entry.id);
      if (categorySet.size === 0) {
        this.categoryIndex.delete(entry.category);
      }
    }

    // Remove from keyword index
    entry.keywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      const keywordSet = this.keywordIndex.get(normalizedKeyword);
      if (keywordSet) {
        keywordSet.delete(entry.id);
        if (keywordSet.size === 0) {
          this.keywordIndex.delete(normalizedKeyword);
        }
      }
    });
  }

  /**
   * Normalize text for consistent processing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Initialize default knowledge base entries
   */
  private initializeDefaultKnowledge(): void {
    const defaultEntries: Array<Omit<KnowledgeEntry, 'id' | 'lastUpdated'>> = [
      // FAQ entries
      {
        category: 'faq',
        question: 'What is this chatbot?',
        answer: 'This is an AI-powered chatbot that can help you with frequently asked questions, troubleshooting, onboarding guidance, and product information. It uses open-source language models to provide helpful responses.',
        keywords: ['chatbot', 'ai', 'help', 'assistant', 'what is']
      },
      {
        category: 'faq',
        question: 'How do I use voice commands?',
        answer: 'Click the microphone button to activate voice input. Speak clearly and the system will convert your speech to text. The chatbot can also read responses aloud if voice output is enabled.',
        keywords: ['voice', 'speech', 'microphone', 'audio', 'speak']
      },
      {
        category: 'faq',
        question: 'Is my conversation data secure?',
        answer: 'Yes, your conversations are processed securely. We use encryption for data transmission and follow privacy best practices. Sensitive information is handled appropriately and data retention policies are enforced.',
        keywords: ['security', 'privacy', 'data', 'secure', 'encryption']
      },

      // Onboarding entries
      {
        category: 'onboarding',
        question: 'How do I get started?',
        answer: 'Welcome! To get started: 1) Ask me any question using text or voice, 2) I can help with FAQs, troubleshooting, and product information, 3) Use the suggestions provided to explore different topics.',
        keywords: ['getting started', 'start', 'begin', 'first time', 'new user']
      },
      {
        category: 'onboarding',
        question: 'How do I integrate the chatbot into my website?',
        answer: 'Integration is simple: 1) Include our JavaScript widget, 2) Configure your preferences, 3) Customize the styling to match your brand. The widget is designed to work with all modern web technologies.',
        keywords: ['integration', 'embed', 'website', 'install', 'setup']
      },

      // Troubleshooting entries
      {
        category: 'troubleshooting',
        question: 'The chatbot is not responding',
        answer: 'If the chatbot isn\'t responding: 1) Check your internet connection, 2) Refresh the page, 3) Try rephrasing your question, 4) Contact support if the issue persists.',
        keywords: ['not responding', 'not working', 'broken', 'fix', 'troubleshoot']
      },
      {
        category: 'troubleshooting',
        question: 'Voice input is not working',
        answer: 'For voice input issues: 1) Check microphone permissions in your browser, 2) Ensure your microphone is working, 3) Try using a different browser, 4) Fall back to text input if needed.',
        keywords: ['voice', 'microphone', 'speech', 'not working', 'permissions']
      },

      // Product entries
      {
        category: 'product',
        question: 'What features are available?',
        answer: 'Key features include: Text and voice chat, Intent classification, FAQ responses, Troubleshooting guidance, Onboarding assistance, Easy website integration, Customizable styling, and Open-source LLM integration.',
        keywords: ['features', 'capabilities', 'what can', 'functionality']
      },
      {
        category: 'product',
        question: 'What are the system requirements?',
        answer: 'System requirements: Modern web browser with JavaScript enabled, Microphone access for voice features (optional), Internet connection for LLM processing, and Standard web hosting for deployment.',
        keywords: ['requirements', 'system', 'browser', 'compatibility']
      }
    ];

    this.bulkImport(defaultEntries);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
