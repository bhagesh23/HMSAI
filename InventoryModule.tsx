import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Pharmaceutical, MedicalEquipment } from '../types';
import { apiUrl } from '../config/api';

export default function InventoryModule() {
  const [activeTab, setActiveTab] = useState<'pharma' | 'equipment'>('pharma');
  const [pharmaceuticals, setPharmaceuticals] = useState<Pharmaceutical[]>([]);
  const [equipment, setEquipment] = useState<MedicalEquipment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<any | null>(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', status: 'available' });

  useEffect(() => {
    fetchPharmaceuticals();
    fetchEquipment();
  }, []);

  const fetchPharmaceuticals = async () => {
    try {
  const res = await fetch(apiUrl('/api/inventory/pharmaceuticals'));
      const data = await res.json();
      setPharmaceuticals(Array.isArray(data) ? data : []);
  } catch (e) { console.error(e); }
  };

  const fetchEquipment = async () => {
    try {
  const res = await fetch(apiUrl('/api/inventory/equipment'));
      const data = await res.json();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, formType?: string) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    if (formType === 'new') {
      setNewItem(prev => ({ ...prev, [name]: value }));
    } else {
      setShowEditModal((prev: any) => prev ? ({ ...prev, [name]: value }) : prev);
    }
  };

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const res = await fetch(apiUrl('/api/inventory/equipment/add'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            setShowAddModal(false);
            fetchEquipment(); // This line fixes the bug
        } else { alert(data.message); }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };
  
  const handleUpdateItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id, stockQuantity, name, quantity, status } = showEditModal;
    const isPharma = 'stockQuantity' in showEditModal;
  const url = isPharma ? apiUrl(`/api/inventory/pharmaceuticals/${id}`) : apiUrl(`/api/inventory/equipment/${id}`);
    const body = isPharma ? { stockQuantity } : { name, quantity, status };

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            setShowEditModal(null);
            if (isPharma) {
                fetchPharmaceuticals();
            } else {
                fetchEquipment();
            }
        } else { alert(data.message); }
  } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
  };

  const handleDeleteEquipment = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this equipment?')) return;
      try {
          const res = await fetch(apiUrl(`/api/inventory/equipment/${id}`), { method: 'DELETE' });
          const data = await res.json();
          if(data.success) {
              alert(data.message);
              fetchEquipment();
          } else { alert(data.message); }
    } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
  };

  const lowStockCount = pharmaceuticals.filter(p => p.stockQuantity <= p.reorderLevel).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">Track pharmaceutical and asset inventory</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl p-6 shadow-lg"><span className="text-3xl font-bold text-white block mb-2">{pharmaceuticals.length + equipment.length}</span><h3 className="text-white font-semibold">Total Items</h3></div>
        <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-xl p-6 shadow-lg"><span className="text-3xl font-bold text-white block mb-2">{pharmaceuticals.length}</span><h3 className="text-white font-semibold">Pharmaceuticals</h3></div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 shadow-lg"><span className="text-3xl font-bold text-white block mb-2">{equipment.length}</span><h3 className="text-white font-semibold">Medical Equipment</h3></div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 shadow-lg"><span className="text-3xl font-bold text-white block mb-2">{lowStockCount}</span><h3 className="text-white font-semibold">Low Stock Items</h3></div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button onClick={() => setActiveTab('pharma')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'pharma' ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>Pharmaceuticals</button>
            <button onClick={() => setActiveTab('equipment')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'equipment' ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>Medical Equipment</button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pharma' ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pharmaceuticals.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.stockQuantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.reorderLevel}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => setShowEditModal(item)} title="Edit Stock"><Edit2 className="w-5 h-5 text-green-600"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {equipment.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{item.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-4">
                                        <button onClick={() => setShowEditModal(item)} title="Edit Item"><Edit2 className="w-5 h-5 text-green-600"/></button>
                                        <button onClick={() => handleDeleteEquipment(item.id)} title="Delete Item"><Trash2 className="w-5 h-5 text-red-600"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Add New Equipment</h2>
                  <form onSubmit={handleAddItem} className="space-y-4">
                      <input name="name" onChange={(e) => handleInputChange(e, 'new')} placeholder="Equipment Name" className="w-full p-3 border rounded-lg" required />
                      <input type="number" name="quantity" onChange={(e) => handleInputChange(e, 'new')} placeholder="Quantity" className="w-full p-3 border rounded-lg" required />
                      <select name="status" value={newItem.status} onChange={(e) => handleInputChange(e, 'new')} className="w-full p-3 border rounded-lg">
                          <option value="available">Available</option>
                          <option value="in-use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                      </select>
                      <div className="flex justify-end gap-4 pt-4">
                          <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold">Add Item</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Edit Item</h2>
                  <form onSubmit={handleUpdateItem} className="space-y-4">
                      {'stockQuantity' in showEditModal ? (
                          <div>
                              <label className="font-medium">{showEditModal.name}</label>
                              <input type="number" name="stockQuantity" value={showEditModal.stockQuantity} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Stock Quantity" className="w-full p-3 border rounded-lg" required />
                          </div>
                      ) : (
                        <>
                            <input name="name" value={showEditModal.name} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Equipment Name" className="w-full p-3 border rounded-lg" required />
                            <input type="number" name="quantity" value={showEditModal.quantity} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Quantity" className="w-full p-3 border rounded-lg" required />
                            <select name="status" value={showEditModal.status} onChange={(e) => handleInputChange(e, 'edit')} className="w-full p-3 border rounded-lg">
                                <option value="available">Available</option>
                                <option value="in-use">In Use</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </>
                      )}
                      <div className="flex justify-end gap-4 pt-4">
                          <button type="button" onClick={() => setShowEditModal(null)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}