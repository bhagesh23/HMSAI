import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import apiUrl from '../config/api';
import { AccountPayable, AccountReceivable, Patient, Vendor } from '../types';

export default function AccountingModule() {
  const [activeTab, setActiveTab] = useState<'payable' | 'receivable'>('receivable');
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
      type: 'receivable', 
      invoiceNumber: `INV-₹{Math.floor(1000 + Math.random() * 9000)}`, 
      name: '', 
      amount: '', 
      dueDate: '', 
      patientId: ''
  });

  useEffect(() => {
    // Fetch all necessary data when the component loads
    Promise.all([
  fetch(apiUrl('/api/accounting/payable')),
  fetch(apiUrl('/api/accounting/receivable')),
  fetch(apiUrl('/api/patients')),
  fetch(apiUrl('/api/vendors'))
    ]).then(async ([payablesRes, receivablesRes, patientsRes, vendorsRes]) => {
      setPayables(await payablesRes.json());
      setReceivables(await receivablesRes.json());
      setPatients(await patientsRes.json());
      setVendors(await vendorsRes.json());
    }).catch(error => { console.error("Failed to fetch accounting data:", error); });
  }, []);

  const fetchPayables = async () => {
    try {
  const response = await fetch(apiUrl('/api/accounting/payable'));
      setPayables(await response.json());
    } catch (error) { console.error("Failed to fetch payables:", error); }
  };

  const fetchReceivables = async () => {
    try {
  const response = await fetch(apiUrl('/api/accounting/receivable'));
      setReceivables(await response.json());
    } catch (error) { console.error("Failed to fetch receivables:", error); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    const invoiceNumber = name === 'type' 
        ? `INV-${Math.floor(1000 + Math.random() * 9000)}` 
        : newEntry.invoiceNumber;
    setNewEntry(prevState => ({ ...prevState, [name]: value, invoiceNumber }));
  };

  const handleAddEntry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(apiUrl('/api/accounting/add'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry),
        });
        const data = await response.json();
        if (data.success) {
            alert('Entry added successfully!');
            setShowAddModal(false);
            fetchPayables();
            fetchReceivables();
        } else {
            alert(data.message);
        }
  } catch (error) {
    console.error('Failed to add accounting entry:', error);
    alert('Failed to connect to server.');
  }
  };

  const handleUpdateStatus = async (type: string, id: string, newStatus: string) => {
    try {
  const response = await fetch(apiUrl(`/api/accounting/${type}/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: newStatus })
        });
        const data = await response.json();
        if(data.success) {
            alert('Status updated!');
            fetchPayables();
            fetchReceivables();
        } else {
            alert(data.message);
        }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteEntry = async (type: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
        try {
            const response = await fetch(apiUrl(`/api/accounting/${type}/${id}`), { method: 'DELETE' });
            const data = await response.json();
            if(data.success) {
                alert('Entry deleted!');
                fetchPayables();
                fetchReceivables();
            } else {
                alert(data.message);
            }
      } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const dataToDisplay = activeTab === 'payable' ? payables : receivables;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Accounting Module
          </h1>
          <p className="text-gray-600 mt-2">Manage accounts payable and receivable</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button onClick={() => setActiveTab('receivable')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'receivable' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>
              Accounts Receivable (Patient Bills)
            </button>
            <button onClick={() => setActiveTab('payable')} className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${ activeTab === 'payable' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>
              Accounts Payable (Vendor Bills)
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-pink-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Invoice #</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">{activeTab === 'payable' ? 'Vendor' : 'Patient'}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataToDisplay.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50 transition-colors duration-150">
                    <td className="px-6 py-4"><span className="font-semibold text-red-600">{item.invoiceNumber}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activeTab === 'payable' ? (item as any).vendorName : (item as any).patientName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${Number(item.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <select value={item.paymentStatus} onChange={(e) => handleUpdateStatus(activeTab, item.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none appearance-none ${getStatusColor(item.paymentStatus)}`}>
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="overdue">OVERDUE</option>
                        <option value="partial">PARTIAL</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteEntry(activeTab, item.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       {showAddModal && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                    <h2 className="text-2xl font-bold mb-6">Add New Accounting Entry</h2>
                    <form onSubmit={handleAddEntry} className="grid grid-cols-2 gap-4">
                        <select name="type" value={newEntry.type} onChange={handleInputChange} className="col-span-2 p-2 border rounded" required>
                            <option value="receivable">Accounts Receivable (Patient Bill)</option>
                            <option value="payable">Accounts Payable (Vendor Bill)</option>
                        </select>
                        <input name="invoiceNumber" value={newEntry.invoiceNumber} className="p-2 border rounded bg-gray-100 col-span-2" disabled />
                        {newEntry.type === 'payable' ? (
                             <select name="name" onChange={handleInputChange} className="p-2 border rounded col-span-2" required>
                                 <option value="">Select Vendor</option>
                                 {vendors.map(v => <option key={v.id} value={v.vendorName}>{v.vendorName}</option>)}
                             </select>
                        ) : (
                            <select name="patientId" onChange={handleInputChange} className="p-2 border rounded col-span-2" required>
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                            </select>
                        )}
                        <input type="number" name="amount" step="0.01" onChange={handleInputChange} placeholder="Amount" className="p-2 border rounded" required />
                        <input type="date" name="dueDate" onChange={handleInputChange} className="p-2 border rounded" required />
                        <div className="col-span-2 flex justify-end gap-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-lg">Add Entry</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}