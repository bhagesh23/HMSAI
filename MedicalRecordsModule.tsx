import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiUrl } from '../config/api';
import { Patient, Employee } from '../types';

// Local lightweight type to satisfy component usage (central types may differ)
interface MedicalRecord { id: string; patientName?: string; doctorName?: string; recordDate?: string; diagnosis?: string }

export default function MedicalRecordsModule() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Employee[]>([]);
  // Add prescriptionNotes to the state
  const [newRecord, setNewRecord] = useState({ patientId: '', doctorId: '', recordDate: '', diagnosis: '', treatment: '', prescriptionNotes: '' });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    try {
  const res = await fetch(apiUrl('/api/medical-records'));
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
  } catch (e) { 
    console.error("Failed to fetch records:", e); 
    setRecords([]);
  };
  };

  const fetchPatients = async () => {
    try {
  const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json());
  } catch (error) { console.error('Failed to fetch patients:', error); }
  };
  
  const fetchDoctors = async () => {
    try {
  const response = await fetch(apiUrl('/api/employees'));
      // Filter for employees with the 'doctor' role
  const allEmployees = await response.json();
  setDoctors(allEmployees as Employee[]);
  } catch (error) { console.error('Failed to fetch doctors:', error); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const res = await fetch(apiUrl('/api/medical-records/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        fetchRecords();
      } else {
        alert(data.message);
      }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
  const response = await fetch(apiUrl(`/api/medical-records/${recordId}`), { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          fetchRecords();
        } else {
          alert(data.message);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) { alert('Failed to connect to server.'); }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Medical Records
          </h1>
          <p className="text-gray-600 mt-2">Manage patient medical history and records</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Record</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Records</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Doctor</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Diagnosis</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {records.map(record => (
                        <tr key={record.id} className="hover:bg-green-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{record.patientName}</td>
                            <td className="px-6 py-4 text-gray-700">{record.doctorName}</td>
                            <td className="px-6 py-4 text-gray-600">{record.recordDate ? new Date(record.recordDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-800">{record.diagnosis}</td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDeleteRecord(record.id)} className="text-red-500 hover:text-red-700" title="Delete Record">
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
                  <h2 className="text-2xl font-bold mb-6">Add Medical Record</h2>
                  <form onSubmit={handleAddRecord} className="space-y-4">
                      <select name="patientId" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                          <option value="">Select Patient</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (ID: {p.patientId})</option>)}
                      </select>
                      <select name="doctorId" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                          <option value="">Select Doctor</option>
                           {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                      </select>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Record Date</label>
                        <input name="recordDate" type="date" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                      </div>
                      <input name="diagnosis" onChange={handleInputChange} placeholder="Diagnosis" className="w-full p-3 border rounded-lg" required/>
                      <textarea name="treatment" onChange={handleInputChange} placeholder="Treatment Notes..." className="w-full p-3 border rounded-lg" rows={3}></textarea>
                      {/* --- NEW FEATURE: PRESCRIPTION FIELD --- */}
                      <textarea name="prescriptionNotes" onChange={handleInputChange} placeholder="Prescription (e.g., Paracetamol 500mg, twice a day for 3 days)" className="w-full p-3 border border-blue-300 rounded-lg" rows={3}></textarea>

                      <div className="flex justify-end gap-4 pt-4">
                          <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Save Record</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}