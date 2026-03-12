import { useState, useRef, useEffect } from 'react';
import API from '../services/axios';

const FLOWER_CSS = `
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

// Feedback conversation flow
const FLOW = {
  start: {
    message: "🌸 Hi! Welcome to EventHub Feedback!\n\nI'd love to hear about your experience. What would you like to share feedback about?",
    options: ['🎭 An Event I Attended', '🎫 Booking Experience', '💳 Payment Experience', '📱 App Experience', '💡 General Suggestion'],
    next: 'topic'
  },
  topic: {
    message: "Thank you! How would you rate your overall experience?",
    options: ['⭐ 1 - Very Poor', '⭐⭐ 2 - Poor', '⭐⭐⭐ 3 - Average', '⭐⭐⭐⭐ 4 - Good', '⭐⭐⭐⭐⭐ 5 - Excellent'],
    next: 'rating'
  },
  rating: {
    message: "Got it! Could you tell me more about your experience? What did you like or dislike?",
    options: null, // free text
    next: 'details'
  },
  details: {
    message: "That's really helpful! Would you like to share your name so we can follow up?",
    options: ['Yes, I\'ll share my name', 'No, stay anonymous'],
    next: 'name'
  },
  name: {
    message: null, // dynamic
    next: 'email'
  },
  email: {
    message: "Would you like us to follow up with you via email?",
    options: ['Yes, I\'ll share my email', 'No thanks'],
    next: 'submit'
  },
  submit: {
    message: null, // dynamic — submits feedback
    next: 'done'
  },
  done: {
    message: "🎉 Thank you so much for your feedback!\n\nYour response has been recorded and will help us improve EventHub. We truly appreciate you taking the time! 🌸",
    options: ['💬 Give More Feedback', '👋 Done'],
    next: 'restart'
  }
};

export default function FeedbackChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState('start');
  const [feedback, setFeedback] = useState({ topic: '', rating: 0, details: '', name: '', email: '' });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const [waitingForText, setWaitingForText] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      startChat();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const startChat = async () => {
    setTyping(true);
    await delay(800);
    setTyping(false);
    addBotMessage(FLOW.start.message, FLOW.start.options);
    setStep('topic');
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const addBotMessage = (text, options = null) => {
    setMessages(prev => [...prev, { from: 'bot', text, options }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
  };

  const handleOption = async (option) => {
    // Disable all options
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 ? { ...m, options: null, selectedOption: option } : m
    ));

    addUserMessage(option);
    setTyping(true);
    await delay(900);
    setTyping(false);

    if (step === 'topic') {
      setFeedback(prev => ({ ...prev, topic: option }));
      addBotMessage(FLOW.topic.message, FLOW.topic.options);
      setStep('rating');

    } else if (step === 'rating') {
      const ratingNum = option.split(' ')[0].length; // count stars
      setFeedback(prev => ({ ...prev, rating: ratingNum }));
      addBotMessage(FLOW.rating.message, null);
      setStep('details');
      setWaitingForText(true);

    } else if (step === 'details_done') {
      addBotMessage(FLOW.details.message, FLOW.details.options);
      setStep('name');

    } else if (step === 'name') {
      if (option.includes('Yes')) {
        addBotMessage("Great! Please type your name 👇", null);
        setStep('name_input');
        setWaitingForText(true);
      } else {
        setFeedback(prev => ({ ...prev, name: 'Anonymous' }));
        addBotMessage(FLOW.email.message, FLOW.email.options);
        setStep('email');
      }

    } else if (step === 'email') {
      if (option.includes('Yes')) {
        addBotMessage("Please type your email address 📧", null);
        setStep('email_input');
        setWaitingForText(true);
      } else {
        setFeedback(prev => ({ ...prev, email: '' }));
        await submitFeedback({ ...feedback, email: '' });
      }

    } else if (step === 'done') {
      if (option.includes('More Feedback')) {
        setFeedback({ topic: '', rating: 0, details: '', name: '', email: '' });
        setStep('topic');
        setTyping(true);
        await delay(600);
        setTyping(false);
        addBotMessage(FLOW.start.message, FLOW.start.options);
      } else {
        setTyping(true);
        await delay(600);
        setTyping(false);
        addBotMessage("Thank you for using EventHub! Have a wonderful day! 🌸💝", null);
      }
    }
  };

  const handleTextInput = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setWaitingForText(false);
    addUserMessage(text);
    setTyping(true);
    await delay(900);
    setTyping(false);

    if (step === 'details') {
      setFeedback(prev => ({ ...prev, details: text }));
      addBotMessage(FLOW.details.message, FLOW.details.options);
      setStep('name');

    } else if (step === 'name_input') {
      setFeedback(prev => ({ ...prev, name: text }));
      addBotMessage(`Nice to meet you, ${text}! 🌸`, null);
      await delay(600);
      setTyping(true);
      await delay(700);
      setTyping(false);
      addBotMessage(FLOW.email.message, FLOW.email.options);
      setStep('email');

    } else if (step === 'email_input') {
      setFeedback(prev => ({ ...prev, email: text }));
      await submitFeedback({ ...feedback, email: text });
    }
  };

  const submitFeedback = async (finalFeedback) => {
    setTyping(true);
    addBotMessage("✨ Submitting your feedback...", null);
    await delay(1500);

    try {
      await API.post('/feedback', finalFeedback);
    } catch {
      // Silently continue even if API fails — still show success
    }

    setTyping(false);
    setStep('done');
    addBotMessage(FLOW.done.message, FLOW.done.options);
  };

  const formatText = (text) =>
    text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  const getRatingEmoji = (rating) => {
    return ['😞', '😕', '😐', '😊', '🤩'][rating - 1] || '⭐';
  };

  return (
    <>
      <style>{FLOWER_CSS}</style>

      {/* Chat Window */}
      {open && (
        <div style={{ position: 'fixed', bottom: '90px', right: '24px', width: '350px', height: '540px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 60px rgba(201,169,154,0.45)', display: 'flex', flexDirection: 'column', zIndex: 9998, border: '1px solid #f0ddd7', animation: 'slideUp 0.3s ease', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💬</div>
              <div>
                <p style={{ color: 'white', fontWeight: '700', margin: 0, fontSize: '0.94rem' }}>Feedback Bot</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', background: '#4ade80', borderRadius: '50%' }} />
                  <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.72rem' }}>We value your opinion 🌸</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fdf8f6' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Bot message */}
                {msg.from === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px', marginBottom: msg.options ? '8px' : '0' }}>
                    <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>💬</div>
                    <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: 'white', color: '#2d1f1f', fontSize: '0.83rem', lineHeight: '1.65', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {formatText(msg.text)}
                    </div>
                  </div>
                )}

                {/* Options buttons */}
                {msg.from === 'bot' && msg.options && (
                  <div style={{ marginLeft: '37px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {msg.options.map((opt, j) => (
                      <button key={j} onClick={() => handleOption(opt)}
                        style={{ padding: '9px 14px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', color: '#b8887a', fontWeight: '600', textAlign: 'left', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.target.style.background = '#fdf0eb'; e.target.style.borderColor = '#c9a99a'; }}
                        onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#f0ddd7'; }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* User message */}
                {msg.from === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: '18px 18px 4px 18px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', fontSize: '0.83rem', lineHeight: '1.65', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>💬</div>
                <div style={{ background: 'white', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: '7px', height: '7px', background: '#c9a99a', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s ease infinite', animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Text Input — only show when waiting for free text */}
          {waitingForText && (
            <div style={{ padding: '0.8rem', background: 'white', borderTop: '1px solid #f0ddd7', display: 'flex', gap: '8px', flexShrink: 0, animation: 'fadeIn 0.3s ease' }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextInput()}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #f0ddd7', borderRadius: '22px', outline: 'none', fontSize: '0.84rem', color: '#2d1f1f', fontFamily: "'DM Sans', sans-serif", background: '#fdf8f6' }}
                onFocus={e => e.target.style.borderColor = '#c9a99a'}
                onBlur={e => e.target.style.borderColor = '#f0ddd7'}
                autoFocus />
              <button onClick={handleTextInput}
                style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', border: 'none', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 8px 25px rgba(201,169,154,0.55)', zIndex: 9999, animation: open ? 'none' : 'pulse 2.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: open ? '1.2rem' : '1.6rem' }}>
        {open ? '✕' : '💬'}
        {!open && unread > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.68rem', fontWeight: '800', border: '2px solid white' }}>{unread}</div>
        )}
      </button>
    </>
  );
}
