import { 
  validateMessageContent, 
  generateSessionId, 
  generateMessageId, 
  generateUUID,
  isEmptyOrWhitespace, 
  sanitizeInput,
  createMessage,
  createSession,
  createKnowledgeEntry
} from './index';

describe('Utility Functions', () => {
  describe('validateMessageContent', () => {
    it('should return true for valid messages', () => {
      expect(validateMessageContent('Hello world')).toBe(true);
      expect(validateMessageContent('  Valid message  ')).toBe(true);
    });

    it('should return false for empty or whitespace messages', () => {
      expect(validateMessageContent('')).toBe(false);
      expect(validateMessageContent('   ')).toBe(false);
      expect(validateMessageContent('\t\n')).toBe(false);
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      
      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      
      expect(id1).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('isEmptyOrWhitespace', () => {
    it('should return true for empty or whitespace strings', () => {
      expect(isEmptyOrWhitespace('')).toBe(true);
      expect(isEmptyOrWhitespace('   ')).toBe(true);
      expect(isEmptyOrWhitespace('\t\n')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmptyOrWhitespace('hello')).toBe(false);
      expect(isEmptyOrWhitespace('  hello  ')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeInput('  hello   world  ')).toBe('hello world');
      expect(sanitizeInput('hello\t\tworld')).toBe('hello world');
      expect(sanitizeInput('hello\n\nworld')).toBe('hello world');
    });
  });
});
  describe('generateUUID', () => {
    it('should generate valid UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(uuid2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('createMessage', () => {
    it('should create valid message objects', () => {
      const sessionId = 'test-session';
      const content = 'Hello world';
      const message = createMessage(sessionId, content);
      
      expect(message.sessionId).toBe(sessionId);
      expect(message.content).toBe(content);
      expect(message.type).toBe('user');
      expect(message.id).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should sanitize message content', () => {
      const message = createMessage('session', '  hello   world  ');
      expect(message.content).toBe('hello world');
    });

    it('should accept different message types', () => {
      const assistantMessage = createMessage('session', 'Hello', 'assistant');
      expect(assistantMessage.type).toBe('assistant');
    });
  });

  describe('createSession', () => {
    it('should create valid session objects', () => {
      const session = createSession();
      
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.lastActivity).toBeInstanceOf(Date);
      expect(session.context.messages).toEqual([]);
      expect(session.configuration.maxMessages).toBe(50);
      expect(session.configuration.responseTimeout).toBe(5000);
      expect(session.configuration.voiceEnabled).toBe(false);
      expect(session.configuration.language).toBe('en');
    });

    it('should accept custom configuration', () => {
      const customConfig = { maxMessages: 100, voiceEnabled: true };
      const session = createSession('user123', customConfig);
      
      expect(session.userId).toBe('user123');
      expect(session.configuration.maxMessages).toBe(100);
      expect(session.configuration.voiceEnabled).toBe(true);
      expect(session.configuration.language).toBe('en'); // default preserved
    });
  });

  describe('createKnowledgeEntry', () => {
    it('should create valid knowledge entry objects', () => {
      const entry = createKnowledgeEntry(
        'faq',
        'What is this?',
        'This is a test',
        ['test', 'faq']
      );
      
      expect(entry.category).toBe('faq');
      expect(entry.question).toBe('What is this?');
      expect(entry.answer).toBe('This is a test');
      expect(entry.keywords).toEqual(['test', 'faq']);
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(entry.lastUpdated).toBeInstanceOf(Date);
    });

    it('should sanitize input text', () => {
      const entry = createKnowledgeEntry(
        'product',
        '  What is   this?  ',
        '  This is   a test  ',
        ['  test  ', '  product  ']
      );
      
      expect(entry.question).toBe('What is this?');
      expect(entry.answer).toBe('This is a test');
      expect(entry.keywords).toEqual(['test', 'product']);
    });
  });