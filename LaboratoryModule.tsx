import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Activity, TestTube, Thermometer, Trash2 } from 'lucide-react';
import { LabTest, Patient } from '../types';
import { apiUrl } from '../config/api';

export default function LaboratoryModule() {
  const [activeTab, setActiveTab] = useState<'tests' | 'results' | 'vitals' | 'equipment'>('tests');
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTest, setNewTest] = useState({
      testNumber: `LAB${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: '',
      testName: '',
      testDate: '',
  });

  useEffect(() => {
    if (activeTab === 'tests') {
        fetchLabTests();
        fetchPatients();
    }
  }, [activeTab]);

  const fetchLabTests = async () => {
    try {
  const response = await fetch(apiUrl('/api/laboratory/tests'));
      setLabTests(await response.json());
  } catch (error) { console.error('Failed to fetch lab tests:', error); }
  };

  const fetchPatients = async () => {
    try {
  const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json());
  } catch (error) { console.error('Failed to fetch patients:', error); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    setNewTest(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddTest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(apiUrl('/api/laboratory/tests/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      const data = await response.json();
      if (data.success) {
        alert('Lab test added successfully!');
        setShowAddModal(false);
        fetchLabTests();
      } else {
        alert(data.message);
      }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleUpdateStatus = async (testId: string, newStatus: string) => {
      try {
          const response = await fetch(apiUrl(`/api/laboratory/tests/${testId}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
          });
          const data = await response.json();
          if (data.success) {
              fetchLabTests(); // Refresh list to show updated status
          } else {
              alert(data.message);
          }
      } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteTest = async (testId: string) => {
      if (window.confirm('Are you sure you want to delete this test?')) {
          try {
              const response = await fetch(apiUrl(`/api/laboratory/tests/${testId}`), { method: 'DELETE' });
              const data = await response.json();
              if (data.success) {
                  alert('Test deleted!');
                  fetchLabTests();
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Laboratory Module
          </h1>
          <p className="text-gray-600 mt-2">Manage lab tests, results, and patient vitals</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Test</span>
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: labTests.length, icon: TestTube, color: 'from-violet-500 to-purple-500' },
          { label: 'Pending Results', value: labTests.filter(t => t.status === 'pending').length, icon: Activity, color: 'from-blue-500 to-cyan-500' },
          { label: 'Completed', value: labTests.filter(t => t.status === 'completed').length, icon: Activity, color: 'from-green-500 to-emerald-500' },
          { label: 'Equipment Active', value: '28', icon: Thermometer, color: 'from-orange-500 to-amber-500' },
        ].map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-2"> <stat.icon className="w-8 h-8 text-white" /> <span className="text-2xl font-bold text-white">{stat.value}</span> </div>
            <h3 className="text-white font-semibold">{stat.label}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {[{ key: 'tests', label: 'Lab Tests' }, { key: 'results', label: 'Results' }, { key: 'vitals', label: 'Vitals' }, { key: 'equipment', label: 'Equipment' }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === tab.key ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-violet-50 to-purple-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Test Number</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Test Name</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {labTests.map((test) => (
                      <tr key={test.id} className="hover:bg-violet-50 transition-colors duration-150">
                        <td className="px-6 py-4"><span className="font-semibold text-violet-600">{test.testNumber}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-900">{(test as any).patientName || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{test.testName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(test.testDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                            <select value={test.status} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleUpdateStatus(test.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none appearance-none ${test.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                <option value="pending">PENDING</option>
                                <option value="completed">COMPLETED</option>
                            </select>
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => handleDeleteTest(test.id)} className="text-red-600 hover:text-red-800" title="Delete Test">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab !== 'tests' && (<div className="text-center py-12"><Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">{activeTab} management interface</p></div>)}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6">Schedule New Lab Test</h2>
                <form onSubmit={handleAddTest} className="grid grid-cols-2 gap-4">
                    <input name="testNumber" value={newTest.testNumber} onChange={handleInputChange} className="p-2 border rounded bg-gray-100" disabled />
                    <select name="patientId" onChange={handleInputChange} className="p-2 border rounded" required>
                        <option value="">Select Patient</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                    <input name="testName" onChange={handleInputChange} placeholder="Test Name" className="col-span-2 p-2 border rounded" required />
                    <input type="date" name="testDate" onChange={handleInputChange} className="col-span-2 p-2 border rounded" required />
                    <div className="col-span-2 flex justify-end gap-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-violet-500 text-white rounded-lg">Add Test</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}