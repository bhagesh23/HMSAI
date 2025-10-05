import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Search, Eye, Trash2, CreditCard as Edit2 } from 'lucide-react';
import { Patient } from '../types';
import { apiUrl } from '../config/api';

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<'add' | 'details' | 'edit' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    patientId: `PAT${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
    phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '', status: 'active'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
    const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json());
    } catch (error) { console.error('Failed to fetch patients:', error); }
  };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, formType?: string) => {
        const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    if (formType === 'new') {
        setNewPatient(prevState => ({ ...prevState, [name]: value }));
    } else if (selectedPatient) {
        setSelectedPatient((prevState: Patient | null) => prevState ? ({ ...prevState, [name]: value } as Patient) : prevState);
    }
  };

    const handleAddPatient = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    try {
    const response = await fetch(apiUrl('/api/patients/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      const data = await response.json();
      if (data.success) {
        alert('Patient added successfully!');
        setModal(null);
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to the server.', error); alert('Failed to connect to the server.'); }
  };

    const handleUpdatePatient = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    if (!selectedPatient) return;
    try {
    const response = await fetch(apiUrl(`/api/patients/${selectedPatient.id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedPatient),
        });
        const data = await response.json();
        if (data.success) {
            alert('Patient updated successfully!');
            setModal(null);
            fetchPatients();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

    const handleDeletePatient = async (patientId: string) => {
      if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
          try {
              const response = await fetch(apiUrl(`/api/patients/${patientId}`), {
                  method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                  alert('Patient deleted successfully!');
                  fetchPatients();
              } else {
                  alert(data.message);
              }
          } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
      }
  };

    const openModal = (type: 'add' | 'details' | 'edit' | null, patient: Patient | null = null) => {
        setModal(type);
        if (patient) setSelectedPatient(JSON.parse(JSON.stringify(patient)) as Patient); // Create a copy
    if (type === 'add') {
        setNewPatient({
            patientId: `PAT${Math.floor(1000 + Math.random() * 9000)}`,
            firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
            phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '', status: 'active'
        });
    }
  };

  const filteredPatients = patients.filter(p =>
    Object.values(p).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

    const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'discharged': return 'bg-gray-100 text-gray-700';
      case 'transferred': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between animate-slide-down">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent animate-slide-in-left">
                    Patient Management
                </h1>
                <p className="text-gray-600 mt-2">Manage patient records and information</p>
            </div>
            <button onClick={() => openModal('add')} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center space-x-2 animate-bounce-in relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Register Patient</span>
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover animate-slide-up">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-300" />
                <input
                type="text"
                placeholder="Search patients by any detail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all duration-300 hover:border-pink-300"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-pink-50 to-rose-50">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient ID</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                        <tr key={patient.id} className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <td className="px-6 py-4"><span className="font-semibold text-pink-600">{patient.patientId}</span></td>
                            <td className="px-6 py-4">
                                <div>
                                <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
                                <p className="text-sm text-gray-500">{patient.email}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                            <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)} transition-all duration-300 hover:scale-110 inline-block`}>{patient.status.toUpperCase()}</span></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => openModal('details', patient)} title="View Details" className="transform hover:scale-125 transition-all duration-200"><Eye className="w-5 h-5 text-blue-600 hover:text-blue-700"/></button>
                                    <button onClick={() => openModal('edit', patient)} title="Edit" className="transform hover:scale-125 transition-all duration-200"><Edit2 className="w-5 h-5 text-green-600 hover:text-green-700"/></button>
                                    <button onClick={() => handleDeletePatient(patient.id)} title="Delete" className="transform hover:scale-125 transition-all duration-200"><Trash2 className="w-5 h-5 text-red-600 hover:text-red-700"/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- MODALS --- */}

        {modal === 'add' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-scale-in transform">
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Register New Patient</h2>
                    <form onSubmit={handleAddPatient} className="grid grid-cols-2 gap-4">
                        <input name="patientId" value={newPatient.patientId} disabled className="col-span-2 p-3 border-2 rounded-lg bg-gray-100 font-semibold text-gray-600" />
                        <input name="firstName" onChange={(e) => handleInputChange(e, 'new')} placeholder="First Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" required />
                        <input name="lastName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Last Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" required />
                        <input type="date" name="dateOfBirth" onChange={(e) => handleInputChange(e, 'new')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="email" type="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="bloodGroup" onChange={(e) => handleInputChange(e, 'new')} placeholder="Blood Group" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="address" onChange={(e) => handleInputChange(e, 'new')} placeholder="Address" className="col-span-2 p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="emergencyContact" onChange={(e) => handleInputChange(e, 'new')} placeholder="Emergency Contact Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />
                        <input name="emergencyPhone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Emergency Contact Phone" className="p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 hover:border-pink-300" />

                        <div className="col-span-2 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">Register</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {modal === 'edit' && selectedPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-scale-in">
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Edit Patient Details</h2>
                    <form onSubmit={handleUpdatePatient} className="grid grid-cols-2 gap-4">
                        <input name="firstName" value={selectedPatient.firstName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <input name="lastName" value={selectedPatient.lastName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <input type="date" name="dateOfBirth" value={selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toISOString().split('T')[0] : ''} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <input name="phone" value={selectedPatient.phone} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <input name="email" value={selectedPatient.email} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <input name="bloodGroup" value={selectedPatient.bloodGroup} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300" />
                        <select name="status" value={selectedPatient.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-green-300 col-span-2">
                            <option value="active">Active</option>
                            <option value="discharged">Discharged</option>
                            <option value="transferred">Transferred</option>
                        </select>
                        <div className="col-span-2 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {modal === 'details' && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                    <p><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Address:</strong> {selectedPatient.address}</p>
                    <p><strong>Emergency Contact:</strong> {selectedPatient.emergencyContact} ({selectedPatient.emergencyPhone})</p>
                    <p><strong>Status:</strong> <span className="font-semibold">{selectedPatient.status.toUpperCase()}</span></p>
                  </div>
                  <button onClick={() => setModal(null)} className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">Close</button>
              </div>
          </div>
        )}
    </div>
  );
}