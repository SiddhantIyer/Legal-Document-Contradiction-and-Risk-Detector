import React, { useState, useRef, useEffect } from 'react';
import { chatMessages as initialMessages, suggestedQuestions } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const mockResponses = [
  `Based on the analysis of this contract, **Section 27 of the Indian Contract Act 1872** renders most non-compete clauses void as they are considered agreements in restraint of trade.\n\nHowever, non-solicitation clauses with reasonable scope and duration may be enforceable.\n\n> **Key Point:** The 2-year restriction in Clause 11.1 is almost certainly unenforceable in India.`,
  `The termination provisions create a significant imbalance:\n\n1. **Provider** can terminate immediately without cause (Clause 6.1)\n2. **Client** has no corresponding right\n3. Combined with non-refundable fees (Clause 3.5), this creates maximum exposure\n\n**Risk Level: CRITICAL**\n\nRecommend adding mutual termination rights with 30-day notice period.`,
  `The governing law analysis reveals:\n\n- **Clause 9.1** specifies Delaware law\n- **Clause 12.4** specifies San Francisco jurisdiction\n- These are inconsistent and create enforcement complications\n\nUnder the **Arbitration and Conciliation Act 1996**, Indian parties can negotiate for arbitration in India.\n\n> Recommendation: Unify governing law and dispute resolution to Indian jurisdiction.`,
];

export default function LegalChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const responseIndex = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response after delay
    setTimeout(() => {
      const response = mockResponses[responseIndex.current % mockResponses.length];
      responseIndex.current += 1;

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          { law: 'Indian Contract Act 1872', section: 'Section 27' },
        ],
        clauseRefs: ['11.1', '6.1'],
      };

      setIsTyping(false);
      setMessages(prev => [...prev, assistantMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text) => {
    // Simple markdown-like rendering
    return text.split('\n').map((line, i) => {
      if (line.startsWith('> ')) {
        return (
          <blockquote key={i} style={{ borderLeft: '4px solid var(--spicy-paprika)', paddingLeft: '1rem', margin: '0.5rem 0', color: 'var(--charcoal-brown)' }}>
            {renderInline(line.slice(2))}
          </blockquote>
        );
      }
      if (line.startsWith('- ') || line.match(/^\d+\. /)) {
        return <p key={i} style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>{renderInline(line)}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} style={{ margin: '0.25rem 0' }}>{renderInline(line)}</p>;
    });
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <section className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="dashboard-header" style={{ flexShrink: 0 }}>
        <span className="label">RAG-Powered Analysis</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Legal<br/>Chat.</h1>
      </header>

      {/* MESSAGES */}
      <div className="chat-messages" style={{ flexGrow: 1 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p>{msg.content}</p>}

            {msg.citations && msg.citations.length > 0 && (
              <div className="chat-citations">
                {msg.citations.map((cite, i) => (
                  <span key={i} className="citation-tag">
                    {cite.law} — {cite.section}
                  </span>
                ))}
                {msg.clauseRefs && msg.clauseRefs.map((ref, i) => (
                  <span key={`ref-${i}`} className="citation-tag" style={{ backgroundColor: 'rgba(235,94,40,0.1)', borderColor: 'var(--spicy-paprika)' }}>
                    § Clause {ref}
                  </span>
                ))}
              </div>
            )}

            <div className="chat-message-time">{msg.timestamp}</div>
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTED QUESTIONS */}
      <div className="suggested-questions">
        {suggestedQuestions.slice(0, 4).map((q, i) => (
          <button key={i} className="suggested-q-btn" onClick={() => handleSend(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input-container" style={{ flexShrink: 0 }}>
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about clauses, risks, or legal implications..."
          rows={1}
          aria-label="Chat message input"
        />
        <button className="chat-send-btn" onClick={() => handleSend()} disabled={isTyping} aria-label="Send message">
          SEND →
        </button>
      </div>
    </section>
  );
}
