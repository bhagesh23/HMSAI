import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Eye, Edit2, Trash2, RefreshCw, FilePlus } from 'lucide-react';
import { Pharmaceutical, PharmaceuticalCategory, Prescription } from '../types';

export default function PharmacyManagement() {
  const [activeTab, setActiveTab] = useState<'medicines' | 'categories' | 'prescriptions'>('medicines');
  const [pharmaceuticals, setPharmaceuticals] = useState<Pharmaceutical[]>([]);
  const [categories, setCategories] = useState<PharmaceuticalCategory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm] = useState('');
  const [modal, setModal] = useState<'add' | 'details' | 'edit' | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Pharmaceutical | null>(null);
  const [newMedicine, setNewMedicine] = useState({ name: '', categoryId: '', description: '', dosageForm: '', strength: '', unitPrice: '', stockQuantity: '', reorderLevel: '' });

  const fetchAllData = async () => {
    try {
      const [medRes, catRes, presRes] = await Promise.all([
        fetch('http://localhost:8080/api/pharmacy/medicines'),
        fetch('http://localhost:8080/api/pharmacy/categories'),
        fetch('http://localhost:8080/api/pharmacy/prescriptions')
      ]);
      const medicines = await medRes.json();
      const cats = await catRes.json();
      const pres = await presRes.json();
      setPharmaceuticals(medicines);
      setCategories(cats);
      setPrescriptions(pres);
    } catch (err) {
      console.error('Failed to fetch pharmacy data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, formType?: 'new' | 'edit') => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value } = target as { name: string; value: string };
    if (formType === 'new') {
      setNewMedicine(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'edit' && selectedMedicine) {
      setSelectedMedicine(prev => prev ? ({ ...prev, [name]: value } as Pharmaceutical) : prev);
    }
  };

  const handleAddMedicine = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/pharmacy/medicines/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMedicine) });
      const data = await res.json();
      if (data.success) {
        alert('Medicine added successfully!');
        setModal(null);
        fetchAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Add medicine error', err);
      alert('Failed to connect to server.');
    }
  };

  const handleUpdateMedicine = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    try {
      const res = await fetch(`http://localhost:8080/api/pharmacy/medicines/${selectedMedicine.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selectedMedicine) });
      const data = await res.json();
      if (data.success) {
        alert('Medicine updated!');
        setModal(null);
        fetchAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Update medicine error', err);
      alert('Failed to connect to server.');
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/pharmacy/medicines/${medicineId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Medicine deleted!');
        fetchAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Delete medicine error', err);
      alert('Failed to connect to server.');
    }
  };

  const handleUpdatePrescriptionStatus = async (prescriptionId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/pharmacy/prescriptions/${prescriptionId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (data.success) {
        alert('Status updated!');
        fetchAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Update prescription status error', err);
      alert('Failed to connect to the server.');
    }
  };

  const openModal = (type: 'add' | 'details' | 'edit' | null, medicine: Pharmaceutical | null = null) => {
    setModal(type);
    if (medicine) setSelectedMedicine(JSON.parse(JSON.stringify(medicine)) as Pharmaceutical);
    if (type === 'add') {
      setNewMedicine({ name: '', categoryId: '', description: '', dosageForm: '', strength: '', unitPrice: '', stockQuantity: '', reorderLevel: '' });
    }
  };

  const filteredPharmaceuticals = pharmaceuticals.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStockStatus = (stock: number, reorder: number) => {
    if (stock <= reorder) return { color: 'bg-red-100 text-red-700', text: 'Low Stock' };
    if (stock <= reorder * 1.5) return { color: 'bg-yellow-100 text-yellow-700', text: 'Warning' };
    return { color: 'bg-green-100 text-green-700', text: 'In Stock' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Pharmacy Management</h1>
          <p className="text-gray-600 mt-2">Manage medicines, categories, and prescriptions</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchAllData} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-300"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
          <button onClick={() => openModal('add')} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 shadow-lg flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Add Medicine</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button onClick={() => setActiveTab('medicines')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'medicines' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>Medicines</button>
            <button onClick={() => setActiveTab('categories')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'categories' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>Categories</button>
            <button onClick={() => setActiveTab('prescriptions')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'prescriptions' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>Prescriptions</button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'medicines' && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Medicine Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Stock</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPharmaceuticals.map((medicine) => {
                    const stockStatus = getStockStatus(Number(medicine.stockQuantity), Number(medicine.reorderLevel));
                    return (
                      <tr key={medicine.id} className="hover:bg-teal-50">
                        <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{medicine.name}</p><p className="text-sm text-gray-500">{medicine.dosageForm}</p></div></td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">{(medicine as any).categoryName}</span></td>
                        <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{medicine.stockQuantity}</p><p className="text-xs text-gray-500">Reorder: {medicine.reorderLevel}</p></div></td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>{stockStatus.text}</span></td>
                        <td className="px-6 py-4"><div className="flex items-center space-x-3"><button onClick={() => openModal('details', medicine)} title="View Details"><Eye className="w-5 h-5 text-blue-600"/></button><button onClick={() => openModal('edit', medicine)} title="Edit"><Edit2 className="w-5 h-5 text-green-600"/></button><button onClick={() => handleDeleteMedicine(medicine.id)} title="Delete"><Trash2 className="w-5 h-5 text-red-600"/></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{categories.map(c => <div key={c.id} className="bg-gray-100 p-4 rounded-lg"><h3>{c.name}</h3><p>{c.description}</p></div>)}</div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Prescribed by</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Prescription</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prescriptions.length > 0 ? prescriptions.map((presc) => (
                    <tr key={presc.id} className="hover:bg-teal-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{presc.patientId}</td>
                      <td className="px-6 py-4 text-gray-600">{presc.doctorId}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(presc.prescriptionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{presc.notes}</td>
                      <td className="px-6 py-4">
                        <select
                            value={presc.status}
                            onChange={(e) => handleUpdatePrescriptionStatus(presc.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none appearance-none ${
                                presc.status === 'active' ? 'bg-yellow-100 text-yellow-700' :
                                presc.status === 'dispensed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
                          <option value="active">ACTIVE</option>
                          <option value="dispensed">DISPENSED</option>
                          <option value="canceled">CANCELED</option>
                        </select>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-500"><FilePlus className="mx-auto w-12 h-12 text-gray-400" />No prescriptions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6">Add New Medicine</h2>
                <form onSubmit={handleAddMedicine} className="grid grid-cols-2 gap-4">
                    <input name="name" onChange={(e) => handleInputChange(e, 'new')} placeholder="Medicine Name" className="col-span-2 p-2 border rounded" required />
                    <select name="categoryId" onChange={(e) => handleInputChange(e, 'new')} className="p-2 border rounded" required><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input name="dosageForm" onChange={(e) => handleInputChange(e, 'new')} placeholder="Dosage Form" className="p-2 border rounded" />
                    <input name="strength" onChange={(e) => handleInputChange(e, 'new')} placeholder="Strength (e.g., 500mg)" className="p-2 border rounded" />
                    <input type="number" name="unitPrice" step="0.01" onChange={(e) => handleInputChange(e, 'new')} placeholder="Unit Price" className="p-2 border rounded" required />
                    <input type="number" name="stockQuantity" onChange={(e) => handleInputChange(e, 'new')} placeholder="Stock Quantity" className="p-2 border rounded" required />
                    <input type="number" name="reorderLevel" onChange={(e) => handleInputChange(e, 'new')} placeholder="Reorder Level" className="p-2 border rounded" required />
                    <textarea name="description" onChange={(e) => handleInputChange(e, 'new')} placeholder="Description" className="col-span-2 p-2 border rounded" />
                    <div className="col-span-2 flex justify-end gap-4"><button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-lg">Add Medicine</button></div>
                </form>
            </div>
        </div>
      )}

      {modal === 'edit' && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Medicine</h2>
            <form onSubmit={handleUpdateMedicine} className="grid grid-cols-2 gap-4">
              <input name="name" value={selectedMedicine.name} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-2 p-2 border rounded" required />
              <select name="categoryId" value={selectedMedicine.categoryId} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded" required>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input name="dosageForm" value={selectedMedicine.dosageForm} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Dosage Form" className="p-2 border rounded" />
              <input name="strength" value={selectedMedicine.strength} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Strength" className="p-2 border rounded" />
              <input type="number" name="unitPrice" value={selectedMedicine.unitPrice} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Unit Price" className="p-2 border rounded" required />
              <input type="number" name="stockQuantity" value={selectedMedicine.stockQuantity} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Stock Quantity" className="p-2 border rounded" required />
              <input type="number" name="reorderLevel" value={selectedMedicine.reorderLevel} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Reorder Level" className="p-2 border rounded" required />
              <textarea name="description" value={selectedMedicine.description} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Description" className="col-span-2 p-2 border rounded" />
              <div className="col-span-2 flex justify-end gap-4"><button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'details' && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">{selectedMedicine.name}</h2>
            <div className="space-y-2">
              <p><strong>Category:</strong> {categories.find(c => String(c.id) === String(selectedMedicine.categoryId))?.name}</p>
              <p><strong>Description:</strong> {selectedMedicine.description}</p>
              <p><strong>Price:</strong> ${Number(selectedMedicine.unitPrice).toFixed(2)}</p>
              <p><strong>Stock:</strong> {selectedMedicine.stockQuantity}</p>
            </div>
            <button onClick={() => setModal(null)} className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}