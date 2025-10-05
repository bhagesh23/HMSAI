import { useMemo, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import { apiUrl } from '../config/api';
import { Prescription as Rx, LabTest } from '../types';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

type Props = {
  onClose: () => void;
  records?: Array<{ recordDate?: string; diagnosis?: string }>;
  labResults?: LabTest[];
  prescriptions?: Rx[];
  patientName?: string;
};

export default function AIAssistantModal({ onClose, records = [], labResults = [], prescriptions = [], patientName = '' }: Props) {
  const [input, setInput] = useState('Summarize the patient history and suggest next steps.');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const storageKey = `ai_history:${patientName || 'global'}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMessages(JSON.parse(raw) as ChatMessage[]);
    } catch (err) {
      console.error('Failed to load AI history', err);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save AI history', err);
    }
  }, [messages, storageKey]);

  const summary = useMemo(() => {
    const lines: string[] = [];

    if (records.length) {
      const recent = records.slice().sort((a,b) => new Date((b.recordDate || '')).getTime() - new Date((a.recordDate || '')).getTime())[0];
      if (recent) lines.push(`Recent diagnosis: ${recent.diagnosis || 'N/A'} (${recent.recordDate ? new Date(recent.recordDate).toLocaleDateString() : 'unknown'})`);
    }

    if (labResults.length) {
      const recentLab = labResults.slice().sort((a,b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0];
      if (recentLab) lines.push(`Latest lab: ${(recentLab as any).testName || 'Lab'} — status: ${(recentLab as any).status || 'unknown'}`);
    }

    if (prescriptions.length) {
      const meds = prescriptions.slice(0,3).map(p => (p.notes ? `${(p as any).doctorId}: ${p.notes}` : `${(p as any).doctorId}: ${p.prescriptionDate}`));
      if (meds.length) lines.push(`Prescriptions: ${meds.join(' | ')}`);
    }

    if (!lines.length) lines.push('No recent records, lab results, or prescriptions found.');

    // Provide lightweight suggestions
    const suggestions: string[] = [];
    if (lines.some(l => /chest|breath|severe|unconscious|seizure/i.test(l))) {
      suggestions.push('If you are experiencing severe symptoms (chest pain, difficulty breathing, unconsciousness), go to Emergency immediately.');
    } else {
      suggestions.push('If symptoms persist or worsen, consider booking an appointment with General Medicine or the suggested specialty.');
    }

    return { lines, suggestions };
  }, [records, labResults, prescriptions]);

  async function handleSend(e?: FormEvent) {
    if (e) e.preventDefault();
    const userMessage = `${input}\n\nPatient summary:\n${summary.lines.join('\n')}`;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/ai/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
  const replyText = String(data.reply || data?.choices?.[0]?.message?.content || 'No reply');
  const withAssistant: ChatMessage[] = [...newMessages, { role: 'assistant', content: replyText }];
  setMessages(withAssistant);
    } catch (err) {
      console.error('AI assistant fetch error', err);
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting AI service' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    try { localStorage.removeItem(storageKey); } catch (err) { console.error('Failed to clear storage', err); }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Assistant — {patientName || 'Patient'}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

  <form onSubmit={handleSend} className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Summary</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
              {summary.lines.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Suggested next steps</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
              {summary.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Conversation</h3>
            <div className="space-y-3 mt-2 max-h-48 overflow-y-auto">
              {messages.length === 0 && <p className="text-sm text-gray-500">No conversation yet. Use the input below to ask the AI.</p>}
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-white text-right' : 'bg-gray-100 text-left'}`}>
                  <div className="text-xs text-gray-500">{m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI' : 'System'}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Ask follow-up</h3>
            <textarea value={input} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} rows={4} className="w-full p-2 border rounded" />
            <div className="mt-2 flex items-center gap-2">
              <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">{loading ? 'Thinking...' : 'Send'}</button>
              <button type="button" onClick={() => setInput('')} className="px-3 py-1 border rounded">Reset</button>
              <button type="button" onClick={handleClear} className="px-3 py-1 border rounded text-red-600">Clear History</button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Privacy note</h3>
            <p className="text-xs text-gray-500">This assistant can call a server-side LLM proxy. If an API key is not configured on the server, a mock reply is returned and no data is sent to external services.</p>
          </div>

        </form>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-black rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}
