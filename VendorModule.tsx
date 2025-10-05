import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { Vendor } from '../types';
import { apiUrl } from '../config/api';

export default function VendorModule() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState<'add' | 'details' | 'edit' | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState({
      vendorName: '', contactPerson: '', email: '', phone: '', address: '', vendorType: '', status: 'active'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
    const response = await fetch(apiUrl('/api/vendors'));
      const data = await response.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]);
    }
  };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, formType?: string) => {
        const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    if (formType === 'new') {
        setNewVendor(prev => ({ ...prev, [name]: value }));
    } else if (selectedVendor) {
        setSelectedVendor((prev: Vendor | null) => prev ? ({ ...prev, [name]: value } as Vendor) : prev);
    }
  };

  const handleAddVendor = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
          const response = await fetch(apiUrl('/api/vendors/add'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newVendor),
          });
          const data = await response.json();
          if (data.success) {
              alert('Vendor added successfully!');
              setShowModal(null);
              fetchVendors();
          } else {
              alert(data.message);
          }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
          alert('Failed to connect to server.');
      }
  };

    const handleUpdateVendor = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    if (!selectedVendor) return;
    try {
    const response = await fetch(apiUrl(`/api/vendors/${selectedVendor.id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedVendor)
        });
        const data = await response.json();
        if (data.success) {
            alert('Vendor updated successfully!');
            setShowModal(null);
            fetchVendors();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
  };

    const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
        try {
            const response = await fetch(apiUrl(`/api/vendors/${vendorId}`), { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                alert('Vendor deleted successfully!');
                fetchVendors();
            } else {
                alert(data.message);
            }
    } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
    }
  };

  const openModal = (type: 'add' | 'details' | 'edit' | null, vendor: Vendor | null = null) => {
      setShowModal(type);
      if (vendor) setSelectedVendor(JSON.parse(JSON.stringify(vendor)) as Vendor);
      if (type === 'add') {
          setNewVendor({ vendorName: '', contactPerson: '', email: '', phone: '', address: '', vendorType: '', status: 'active' });
      }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-2">Manage suppliers and vendors</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Vendors</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-yellow-50">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact Person</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact Info</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-amber-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{vendor.vendorName}</td>
                            <td className="px-6 py-4 text-gray-700">{vendor.contactPerson}</td>
                            <td className="px-6 py-4 text-sm">
                                <div>{vendor.email}</div>
                                <div className="text-gray-500">{vendor.phone}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{vendor.vendorType}</td>
                            <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>{vendor.status.toUpperCase()}</span></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => openModal('details', vendor)} title="View Details"><Eye className="w-5 h-5 text-blue-600"/></button>
                                    <button onClick={() => openModal('edit', vendor)} title="Edit"><Edit2 className="w-5 h-5 text-green-600"/></button>
                                    <button onClick={() => handleDeleteVendor(vendor.id)} title="Delete"><Trash2 className="w-5 h-5 text-red-600"/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {showModal === 'add' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Add New Vendor</h2>
                  <form onSubmit={handleAddVendor} className="grid grid-cols-2 gap-4">
                      <input name="vendorName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Vendor Name" className="col-span-2 p-3 border rounded-lg" required />
                      <input name="contactPerson" onChange={(e) => handleInputChange(e, 'new')} placeholder="Contact Person" className="p-3 border rounded-lg" />
                      <input type="email" name="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email" className="p-3 border rounded-lg" />
                      <input type="text" name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone" className="p-3 border rounded-lg" />
                      <input name="vendorType" onChange={(e) => handleInputChange(e, 'new')} placeholder="Vendor Type (e.g., Supplies)" className="col-span-2 p-3 border rounded-lg" />
                      <textarea name="address" onChange={(e) => handleInputChange(e, 'new')} placeholder="Address" className="col-span-2 p-3 border rounded-lg" rows={3}></textarea>
                      <div className="col-span-2 flex justify-end gap-4 pt-2">
                          <button type="button" onClick={() => setShowModal(null)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600">Add Vendor</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showModal === 'edit' && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">Edit Vendor</h2>
                  <form onSubmit={handleUpdateVendor} className="grid grid-cols-2 gap-4">
                      <input name="vendorName" value={selectedVendor.vendorName} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-2 p-3 border rounded-lg" required />
                      <input name="contactPerson" value={selectedVendor.contactPerson} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Contact Person" className="p-3 border rounded-lg" />
                      <input type="email" name="email" value={selectedVendor.email} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Email" className="p-3 border rounded-lg" />
                      <input type="text" name="phone" value={selectedVendor.phone} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Phone" className="p-3 border rounded-lg" />
                      <input name="vendorType" value={selectedVendor.vendorType} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Vendor Type" className="p-3 border rounded-lg" />
                      <select name="status" value={selectedVendor.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 border rounded-lg">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                      </select>
                      <div className="col-span-2 flex justify-end gap-4 pt-2">
                          <button type="button" onClick={() => setShowModal(null)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

       {showModal === 'details' && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-6">{selectedVendor.vendorName}</h2>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Contact Person:</strong> {selectedVendor.contactPerson || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedVendor.address || 'N/A'}</p>
                    <p><strong>Type:</strong> {selectedVendor.vendorType || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className="font-semibold">{selectedVendor.status.toUpperCase()}</span></p>
                  </div>
                  <button onClick={() => setShowModal(null)} className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Close</button>
              </div>
          </div>
      )}
    </div>
  );
}