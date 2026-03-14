import { useState, useEffect, useRef } from 'react';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const TOPICS = ['Event Quality', 'App Experience', 'Booking Process', 'Customer Support', 'Pricing', 'Other'];

const BOT_FLOW = [
  { key: 'topic',   question: "Hi! 👋 What would you like to share feedback about?", type: 'options', options: TOPICS },
  { key: 'rating',  question: (topic) => `Got it! How would you rate your experience with **${topic}**?`, type: 'rating' },
  { key: 'details', question: "Any details you'd like to share? (optional)", type: 'text', placeholder: "Tell us more..." },
  { key: 'name',    question: "What's your name? (optional)", type: 'text', placeholder: "Your name" },
  { key: 'email',   question: "Last one — your email? (optional)", type: 'text', placeholder: "you@example.com" },
];

function BotMessage({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', marginBottom:'12px', animation:'fadeUp 0.3s ease' }}>
      <div style={{ width:'28px', height:'28px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', flexShrink:0 }}>✦</div>
      <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px 16px 16px 4px', padding:'10px 14px', maxWidth:'85%' }}>
        <p style={{ color:'#e0e0e0', fontSize:'0.86rem', margin:0, lineHeight:1.5, fontFamily:T }}
          dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'12px', animation:'fadeUp 0.3s ease' }}>
      <div style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'16px 16px 4px 16px', padding:'10px 14px', maxWidth:'80%' }}>
        <p style={{ color:GOLD, fontSize:'0.86rem', margin:0, lineHeight:1.5, fontFamily:T }}>{text}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', marginBottom:'12px' }}>
      <div style={{ width:'28px', height:'28px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', flexShrink:0 }}>✦</div>
      <div style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#555', animation:`bounce 1s ease ${i*0.15}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackChatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState({ topic:'', rating:0, details:'', name:'', email:'' });
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => addBotMessage(BOT_FLOW[0].question), 400);
    }
  }, [open]);

  const addBotMessage = (text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from:'bot', text }]);
    }, 800);
  };

  const handleUserReply = async (value, displayText) => {
    const currentStep = BOT_FLOW[step];
    const newForm = { ...form, [currentStep.key]: value };
    setForm(newForm);
    setMessages(prev => [...prev, { from:'user', text: displayText || String(value) }]);
    setInput('');
    const nextStep = step + 1;
    if (nextStep < BOT_FLOW.length) {
      setStep(nextStep);
      const next = BOT_FLOW[nextStep];
      const question = typeof next.question === 'function' ? next.question(newForm.topic) : next.question;
      addBotMessage(question);
    } else {
      setTyping(true);
      setLoading(true);
      setTimeout(async () => {
        try {
          await API.post('/feedback', {
            topic:   newForm.topic,
            rating:  newForm.rating,
            details: newForm.details || '',
            name:    newForm.name || 'Anonymous',
            email:   newForm.email || '',
          });
          setTyping(false);
          setMessages(prev => [...prev, { from:'bot', text: "Thank you! 🎉 Your feedback has been submitted. We really appreciate it!" }]);
          setDone(true);
        } catch {
          setTyping(false);
          setMessages(prev => [...prev, { from:'bot', text: "Oops! Something went wrong. Please try again later." }]);
        } finally {
          setLoading(false);
        }
      }, 1200);
    }
  };

  const handleTextSubmit = () => {
    if (!input.trim()) return;
    handleUserReply(input.trim(), input.trim());
  };

  const handleSkip = () => handleUserReply('', 'Skip');

  const reset = () => {
    setMessages([]); setStep(0); setInput(''); setDone(false); setTyping(false);
    setForm({ topic:'', rating:0, details:'', name:'', email:'' });
    setTimeout(() => addBotMessage(BOT_FLOW[0].question), 400);
  };

  const currentFlow = BOT_FLOW[step];

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .fb-inp::placeholder { color:#444; }
        .fb-inp:focus { border-color: ${GOLD} !important; outline:none; }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
      `}</style>

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:'28px', right:'28px', zIndex:1000,
        width:'54px', height:'54px', borderRadius:'50%',
        background: open ? '#1a1a1a' : GOLD,
        border: open ? '1px solid rgba(255,255,255,0.12)' : 'none',
        cursor:'pointer', fontSize:'1.3rem',
        boxShadow: open ? '0 4px 20px rgba(0,0,0,0.4)' : '0 8px 28px rgba(212,175,55,0.4)',
        transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center',
        color: open ? '#fff' : '#000',
      }}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position:'fixed', bottom:'96px', right:'28px', zIndex:999,
          width:'340px', background:'#0d0d0d',
          border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px',
          overflow:'hidden', fontFamily:T,
          boxShadow:'0 24px 60px rgba(0,0,0,0.7)',
          animation:'slideUp 0.3s ease',
          display:'flex', flexDirection:'column', height:'480px',
        }}>

          {/* Header */}
          <div style={{ padding:'1rem 1.2rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <div style={{ width:'34px', height:'34px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', flexShrink:0 }}>✦</div>
            <div style={{ flex:1 }}>
              <p style={{ color:'#fff', fontWeight:700, fontSize:'0.9rem', margin:0 }}>NexEvent Support</p>
              <p style={{ color:'#30D158', fontSize:'0.7rem', margin:0, display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#30D158', display:'inline-block' }}/>
                &nbsp;Online
              </p>
            </div>
            {done && (
              <button onClick={reset} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#555', borderRadius:'8px', padding:'5px 10px', cursor:'pointer', fontSize:'0.72rem', fontFamily:T, fontWeight:600 }}>
                Restart
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
            {messages.map((msg, i) => (
              msg.from === 'bot'
                ? <BotMessage key={i} text={msg.text} />
                : <UserMessage key={i} text={msg.text} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          {!done && !typing && messages.length > 0 && (
            <div style={{ padding:'0.8rem 1rem', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>

              {currentFlow?.type === 'options' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {currentFlow.options.map(opt => (
                    <button key={opt} onClick={() => handleUserReply(opt)} style={{
                      padding:'9px 12px', background:'#111',
                      border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px',
                      color:'#A0A0A0', textAlign:'left', cursor:'pointer',
                      fontFamily:T, fontSize:'0.83rem', fontWeight:500, transition:'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.color=GOLD; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#A0A0A0'; }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentFlow?.type === 'rating' && (
                <div>
                  <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'6px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => handleUserReply(n, `${'★'.repeat(n)} (${n}/5)`)} style={{
                        width:'46px', height:'46px', borderRadius:'10px',
                        border:'1px solid rgba(255,255,255,0.1)',
                        background:'#111', cursor:'pointer', fontSize:'1.2rem',
                        color:'#555', transition:'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.color=GOLD; e.currentTarget.style.background='rgba(212,175,55,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#555'; e.currentTarget.style.background='#111'; }}>
                        ★
                      </button>
                    ))}
                  </div>
                  <p style={{ textAlign:'center', color:'#444', fontSize:'0.7rem', margin:0 }}>1 = Poor · 5 = Excellent</p>
                </div>
              )}

              {currentFlow?.type === 'text' && (
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <input className="fb-inp" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                    placeholder={currentFlow.placeholder || 'Type here...'}
                    style={{
                      flex:1, padding:'10px 12px',
                      background:'#111', border:'1px solid rgba(255,255,255,0.1)',
                      borderRadius:'10px', color:'#fff', fontSize:'0.86rem', fontFamily:T,
                    }}
                  />
                  <button onClick={handleTextSubmit} style={{
                    width:'36px', height:'36px', background:GOLD, color:'#000',
                    border:'none', borderRadius:'10px', cursor:'pointer',
                    fontSize:'1rem', flexShrink:0,
                  }}>→</button>
                  <button onClick={handleSkip} style={{
                    padding:'0 10px', height:'36px', background:'transparent',
                    color:'#444', border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:'10px', cursor:'pointer', fontSize:'0.72rem',
                    fontFamily:T, fontWeight:600, whiteSpace:'nowrap',
                  }}>Skip</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
