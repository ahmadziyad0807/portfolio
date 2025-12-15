import { KnowledgeBaseService } from './knowledgeBaseService';
import { KnowledgeEntry } from '@intelligenai/shared';

describe('KnowledgeBaseService', () => {
  let knowledgeBaseService: KnowledgeBaseService;

  beforeEach(() => {
    knowledgeBaseService = new KnowledgeBaseService({
      autoUpdate: false, // Disable auto-update for testing
      cacheTimeout: 1000
    });
    
    // Clear any existing entries
    knowledgeBaseService.clear();
  });

  describe('entry management', () => {
    it('should add new knowledge entries', () => {
      const entryData = {
        category: 'faq' as const,
        question: 'Test question?',
        answer: 'Test answer.',
        keywords: ['test', 'question']
      };

      const entry = knowledgeBaseService.addEntry(entryData);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.category).toBe('faq');
      expect(entry.question).toBe('Test question?');
      expect(entry.answer).toBe('Test answer.');
      expect(entry.keywords).toEqual(['test', 'question']);
      expect(entry.lastUpdated).toBeInstanceOf(Date);
    });

    it('should retrieve entries by ID', () => {
      const entryData = {
        category: 'troubleshooting' as const,
        question: 'How to fix error?',
        answer: 'Follow these steps.',
        keywords: ['error', 'fix']
      };

      const entry = knowledgeBaseService.addEntry(entryData);
      const retrieved = knowledgeBaseService.getEntry(entry.id);

      expect(retrieved).toEqual(entry);
    });

    it('should update existing entries', async () => {
      const entryData = {
        category: 'product' as const,
        question: 'What is the product?',
        answer: 'Original answer.',
        keywords: ['product']
      };

      const entry = knowledgeBaseService.addEntry(entryData);
      
      // Add a small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = knowledgeBaseService.updateEntry(entry.id, {
        answer: 'Updated answer.',
        keywords: ['product', 'updated']
      });

      expect(updated).toBeDefined();
      expect(updated!.answer).toBe('Updated answer.');
      expect(updated!.keywords).toEqual(['product', 'updated']);
      expect(updated!.lastUpdated.getTime()).toBeGreaterThanOrEqual(entry.lastUpdated.getTime());
    });

    it('should delete entries', () => {
      const entryData = {
        category: 'onboarding' as const,
        question: 'How to start?',
        answer: 'Getting started guide.',
        keywords: ['start', 'onboarding']
      };

      const entry = knowledgeBaseService.addEntry(entryData);
      const deleted = knowledgeBaseService.deleteEntry(entry.id);
      const retrieved = knowledgeBaseService.getEntry(entry.id);

      expect(deleted).toBe(true);
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent entries', () => {
      const retrieved = knowledgeBaseService.getEntry('non-existent-id');
      expect(retrieved).toBeNull();

      const updated = knowledgeBaseService.updateEntry('non-existent-id', { answer: 'New answer' });
      expect(updated).toBeNull();

      const deleted = knowledgeBaseService.deleteEntry('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('category-based retrieval', () => {
    beforeEach(() => {
      // Add test entries for different categories
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'FAQ 1',
        answer: 'Answer 1',
        keywords: ['faq1']
      });

      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'FAQ 2',
        answer: 'Answer 2',
        keywords: ['faq2']
      });

      knowledgeBaseService.addEntry({
        category: 'troubleshooting',
        question: 'Troubleshoot 1',
        answer: 'Solution 1',
        keywords: ['trouble1']
      });
    });

    it('should retrieve entries by category', () => {
      const faqEntries = knowledgeBaseService.getEntriesByCategory('faq');
      const troubleshootingEntries = knowledgeBaseService.getEntriesByCategory('troubleshooting');

      expect(faqEntries).toHaveLength(2);
      expect(troubleshootingEntries).toHaveLength(1);
      
      faqEntries.forEach(entry => {
        expect(entry.category).toBe('faq');
      });
    });

    it('should return empty array for categories with no entries', () => {
      const productEntries = knowledgeBaseService.getEntriesByCategory('product');
      expect(productEntries).toEqual([]);
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'What is a chatbot?',
        answer: 'A chatbot is an AI assistant that helps users.',
        keywords: ['chatbot', 'ai', 'assistant']
      });

      knowledgeBaseService.addEntry({
        category: 'troubleshooting',
        question: 'Login not working',
        answer: 'Check your credentials and try again.',
        keywords: ['login', 'credentials', 'authentication']
      });

      knowledgeBaseService.addEntry({
        category: 'product',
        question: 'Product features',
        answer: 'Our product includes chat, voice, and API features.',
        keywords: ['features', 'chat', 'voice', 'api']
      });
    });

    it('should search by query text', () => {
      const results = knowledgeBaseService.search('chatbot AI');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.question).toContain('chatbot');
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].matchedKeywords).toContain('chatbot');
    });

    it('should search within specific categories', () => {
      const results = knowledgeBaseService.search('features', { category: 'product' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.category).toBe('product');
    });

    it('should limit search results', () => {
      const results = knowledgeBaseService.search('chat', { limit: 1 });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should filter by minimum score', () => {
      const results = knowledgeBaseService.search('xyzabc123nonexistent', { minScore: 0.8 });

      expect(results.length).toBe(0);
    });

    it('should return results sorted by score', () => {
      const results = knowledgeBaseService.search('chatbot assistant');

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
      }
    });
  });

  describe('keyword-based search', () => {
    beforeEach(() => {
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'Voice commands',
        answer: 'Use voice commands to interact.',
        keywords: ['voice', 'commands', 'speech']
      });

      knowledgeBaseService.addEntry({
        category: 'troubleshooting',
        question: 'Voice not working',
        answer: 'Check microphone permissions.',
        keywords: ['voice', 'microphone', 'permissions']
      });
    });

    it('should find entries by keywords', () => {
      const entries = knowledgeBaseService.findByKeywords(['voice']);

      expect(entries.length).toBe(2);
      entries.forEach(entry => {
        expect(entry.keywords).toContain('voice');
      });
    });

    it('should find entries by multiple keywords', () => {
      const entries = knowledgeBaseService.findByKeywords(['voice', 'commands']);

      expect(entries.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching keywords', () => {
      const entries = knowledgeBaseService.findByKeywords(['nonexistent']);

      expect(entries).toEqual([]);
    });
  });

  describe('bulk operations', () => {
    it('should bulk import entries', () => {
      const entries = [
        {
          category: 'faq' as const,
          question: 'Bulk 1',
          answer: 'Answer 1',
          keywords: ['bulk1']
        },
        {
          category: 'faq' as const,
          question: 'Bulk 2',
          answer: 'Answer 2',
          keywords: ['bulk2']
        }
      ];

      const imported = knowledgeBaseService.bulkImport(entries);

      expect(imported).toHaveLength(2);
      expect(imported[0].question).toBe('Bulk 1');
      expect(imported[1].question).toBe('Bulk 2');
    });

    it('should export all entries', () => {
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'Export test',
        answer: 'Export answer',
        keywords: ['export']
      });

      const exported = knowledgeBaseService.export();

      expect(exported.length).toBeGreaterThan(0);
      expect(exported.some(entry => entry.question === 'Export test')).toBe(true);
    });

    it('should clear all entries', () => {
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'Clear test',
        answer: 'Clear answer',
        keywords: ['clear']
      });

      knowledgeBaseService.clear();
      const allEntries = knowledgeBaseService.getAllEntries();

      expect(allEntries).toEqual([]);
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'FAQ 1',
        answer: 'Answer 1',
        keywords: ['faq1']
      });

      knowledgeBaseService.addEntry({
        category: 'troubleshooting',
        question: 'Trouble 1',
        answer: 'Solution 1',
        keywords: ['trouble1']
      });
    });

    it('should provide accurate statistics', () => {
      const stats = knowledgeBaseService.getStats();

      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.categoryCounts.faq).toBeGreaterThan(0);
      expect(stats.totalKeywords).toBeGreaterThan(0);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle entries with empty keywords', () => {
      const entry = knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'No keywords',
        answer: 'Answer without keywords',
        keywords: []
      });

      expect(entry).toBeDefined();
      expect(entry.keywords).toEqual([]);
    });

    it('should handle very long questions and answers', () => {
      const longText = 'a'.repeat(10000);
      
      const entry = knowledgeBaseService.addEntry({
        category: 'faq',
        question: longText,
        answer: longText,
        keywords: ['long']
      });

      expect(entry).toBeDefined();
      expect(entry.question).toBe(longText);
    });

    it('should handle special characters in content', () => {
      const entry = knowledgeBaseService.addEntry({
        category: 'faq',
        question: 'Special chars: !@#$%^&*()',
        answer: 'Answer with émojis 🤖 and ñ characters',
        keywords: ['special', 'chars']
      });

      expect(entry).toBeDefined();
      
      const results = knowledgeBaseService.search('special chars');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
