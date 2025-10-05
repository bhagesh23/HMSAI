import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import apiUrl from '../config/api';
import { Patient, Employee, SurgeryRecord } from '../types';

export default function SurgicalModule() {
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [surgeons, setSurgeons] = useState<Employee[]>([]);
  const [newSurgery, setNewSurgery] = useState({ 
    surgeryNumber: `SURG-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: '', 
    surgeonId: '', 
    surgeryType: '', 
    surgeryDate: '', 
    notes: '' 
  });

  useEffect(() => {
    fetchSurgeries();
    fetchPatients();
    fetchSurgeons();
  }, []);

  const fetchSurgeries = async () => {
    try {
  const res = await fetch(apiUrl('/api/surgical'));
      const data = await res.json();
      setSurgeries(Array.isArray(data) ? data : []);
  } catch (e) { console.error("Failed to fetch surgeries:", e); }
  };
  
  const fetchPatients = async () => {
    try {
  const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json());
  } catch (error) { console.error('Failed to fetch patients:', error); }
  };
  
  const fetchSurgeons = async () => {
    try {
  const response = await fetch(apiUrl('/api/employees'));
      setSurgeons(await response.json());
    } catch (error) { console.error('Failed to fetch surgeons:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSurgery(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSurgery = async (e) => {
    e.preventDefault();
    try {
  const res = await fetch(apiUrl('/api/surgical/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSurgery),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        fetchSurgeries();
      } else {
        alert(data.message);
      }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleUpdateStatus = async (surgeryId, newStatus) => {
    try {
  const response = await fetch(apiUrl(`/api/surgical/${surgeryId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if(data.success) {
            fetchSurgeries(); // Refresh list
        } else {
            alert(data.message);
        }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteSurgery = async (surgeryId) => {
    if (window.confirm('Are you sure you want to delete this surgery record?')) {
        try {
            const response = await fetch(apiUrl(`/api/surgical/${surgeryId}`), { method: 'DELETE' });
            const data = await response.json();
            if(data.success) {
                alert(data.message);
                fetchSurgeries();
            } else {
                alert(data.message);
            }
      } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Surgical / Theater Module
          </h1>
          <p className="text-gray-600 mt-2">Manage surgeries and theater equipment</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Schedule Surgery</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Scheduled Surgeries</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Surgery #</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Surgeon</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Procedure</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {surgeries.map(surg => (
                        <tr key={surg.id} className="hover:bg-orange-50">
                            <td className="px-6 py-4 font-medium text-orange-600">{surg.surgeryNumber}</td>
                            <td className="px-6 py-4 text-gray-900">{surg.patientName}</td>
                            <td className="px-6 py-4 text-gray-700">{surg.surgeonName}</td>
                            <td className="px-6 py-4 text-gray-800">{surg.surgeryType}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(surg.surgeryDate).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <select value={surg.status} onChange={(e) => handleUpdateStatus(surg.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none appearance-none ${surg.status === 'completed' ? 'bg-green-100 text-green-700' : surg.status === 'canceled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <option value="scheduled">SCHEDULED</option>
                                    <option value="completed">COMPLETED</option>
                                    <option value="canceled">CANCELED</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDeleteSurgery(surg.id)} className="text-red-500 hover:text-red-700" title="Delete Record">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      
      {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Schedule New Surgery</h2>
                  <form onSubmit={handleAddSurgery} className="grid grid-cols-2 gap-4">
                      <input name="surgeryNumber" value={newSurgery.surgeryNumber} className="p-3 border rounded-lg bg-gray-100" disabled />
                      <select name="patientId" onChange={handleInputChange} className="p-3 border rounded-lg" required>
                          <option value="">Select Patient</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                      </select>
                      <select name="surgeonId" onChange={handleInputChange} className="col-span-2 p-3 border rounded-lg" required>
                          <option value="">Select Surgeon</option>
                          {surgeons.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                      </select>
                      <input name="surgeryType" onChange={handleInputChange} placeholder="Surgery Type / Procedure" className="col-span-2 p-3 border rounded-lg" required/>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Surgery Date & Time</label>
                        <input name="surgeryDate" type="datetime-local" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                      </div>
                      <textarea name="notes" onChange={handleInputChange} placeholder="Notes..." className="col-span-2 p-3 border rounded-lg" rows={3}></textarea>
                      <div className="col-span-2 flex justify-end gap-4 pt-2">
                          <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">Schedule</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}