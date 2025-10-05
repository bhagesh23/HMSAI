import { useState, useEffect, FormEvent } from 'react';
import { MessageSquare, Users, DollarSign, Bed } from 'lucide-react';
import apiUrl from '../config/api';

export default function SMSModule() {
  const [summaries, setSummaries] = useState({
    patients: { total: 0, active: 0 },
    beds: { total: 0, occupied: 0 },
    receivables: { totalCollection: 0 }
  });
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsState, setSmsState] = useState({ to: '', message: '' });

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await fetch(apiUrl('/api/sms/summaries'));
      setSummaries(await response.json());
    } catch (error) { console.error("Failed to fetch summaries:", error); }
  };

  const handleSendSms = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const response = await fetch(apiUrl('/api/sms/send'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(smsState),
        });
        const data = await response.json();
        if (data.success) {
            alert('SMS sent successfully!');
            setShowSmsModal(false);
        } else {
            alert(`Failed to send SMS: ${data.error || data.message}`);
        }
  } catch (error) { console.error('Failed to connect to the server.', error); alert('Failed to connect to the server.'); }
  };

  // NEW function to open the modal with a specific report
  const openSmsModalForReport = async (reportType: string) => {
    try {
        const response = await fetch(apiUrl(`/api/sms/report/${reportType}`));
        const data = await response.json();
        if (data.message) {
            setSmsState({ to: '', message: data.message });
            setShowSmsModal(true);
        } else {
            alert('Could not generate report.');
        }
  } catch (error) {
    console.error('Failed to fetch report data.', error);
    alert('Failed to fetch report data.');
    }
  };

  const summaryCards = [
    { title: 'Patients List', reportType: 'patients', icon: Users, color: 'from-pink-500 to-rose-500', stats: [ { label: 'Total Patients', value: summaries.patients.total }, { label: 'Active', value: summaries.patients.active } ] },
    { title: 'OPD Cash Summary', reportType: 'opd', icon: DollarSign, color: 'from-green-500 to-emerald-500', stats: [ { label: 'Total Collection', value: `$${Number(summaries.receivables.totalCollection || 0).toLocaleString()}` } ] },
    { title: 'Ward / Bed Status', reportType: 'ward-status', icon: Bed, color: 'from-orange-500 to-amber-500', stats: [ { label: 'Total Beds', value: summaries.beds.total }, { label: 'Occupied', value: summaries.beds.occupied }, { label: 'Available', value: (summaries.beds.total || 0) - (summaries.beds.occupied || 0) } ] },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header remains the same */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">SMS & Reports Module</h1>
                <p className="text-gray-600 mt-2">Send summaries and hospital statistics</p>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaryCards.map((summary, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`bg-gradient-to-r ${summary.color} p-6`}>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm"><summary.icon className="w-8 h-8 text-white" /></div>
                <h3 className="text-2xl font-bold text-white">{summary.title}</h3>
              </div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {summary.stats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-700 font-medium">{stat.label}</span>
                            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                        </div>
                    ))}
                </div>
                {/* MODIFIED Button to call the new function */}
                <button onClick={() => openSmsModalForReport(summary.reportType)} className="mt-4 w-full bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Report via SMS
                </button>
            </div>
          </div>
        ))}
      </div>
      
      {showSmsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Send SMS Notification</h2>
                  <form className="space-y-4" onSubmit={handleSendSms}>
                      <input 
                        placeholder="Recipient Phone Number (e.g., +919876543210)" 
                        className="w-full p-2 border rounded" 
                        value={smsState.to}
                        onChange={(e) => setSmsState({...smsState, to: e.target.value})}
                        required 
                      />
                      <textarea 
                        className="w-full p-2 border rounded" 
                        rows={8}
                        value={smsState.message}
                        onChange={(e) => setSmsState({...smsState, message: e.target.value})}
                        required
                      ></textarea>
                      <div className="flex justify-end gap-4">
                          <button type="button" onClick={() => setShowSmsModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-lg">Send Message</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}