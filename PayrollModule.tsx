import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiUrl } from '../config/api';
import { Employee, PayrollRecord } from '../types';

export default function PayrollModule() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newPayroll, setNewPayroll] = useState({ employeeId: '', payPeriodStart: '', payPeriodEnd: '' });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
  const res = await fetch(apiUrl('/api/payroll'));
      const data = await res.json();
      setPayrolls(Array.isArray(data) ? data : []);
  } catch (e) { console.error("Failed to fetch payrolls:", e); }
  };

  const fetchEmployees = async () => {
    try {
  const response = await fetch(apiUrl('/api/employees'));
      setEmployees(await response.json());
  } catch (error) { console.error('Failed to fetch employees:', error); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    setNewPayroll(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPayroll = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const res = await fetch(apiUrl('/api/payroll/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayroll),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        fetchPayrolls();
      } else {
        alert(data.message);
      }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };
  
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
  const res = await fetch(apiUrl(`/api/payroll/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            fetchPayrolls();
        } else {
            alert(data.message);
        }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeletePayroll = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
        try {
            const res = await fetch(apiUrl(`/api/payroll/${id}`), { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchPayrolls();
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
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Payroll Module
          </h1>
          <p className="text-gray-600 mt-2">Manage employee payroll and salaries</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Generate Payroll</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Payroll History</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Employee</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pay Period</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Salary</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {payrolls.map(p => (
                        <tr key={p.id} className="hover:bg-cyan-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{p.firstName} {p.lastName}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(p.payPeriodStart).toLocaleDateString()} - {new Date(p.payPeriodEnd).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">${Number(p.basicSalary).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <select value={p.status} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleUpdateStatus(p.id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none appearance-none ${getStatusColor(p.status)}`}>
                                    <option value="pending">PENDING</option>
                                    <option value="paid">PAID</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleDeletePayroll(p.id)} className="text-red-500 hover:text-red-700" title="Delete Payroll Record">
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
                  <h2 className="text-2xl font-bold mb-6">Generate New Payroll</h2>
                  <form onSubmit={handleAddPayroll} className="grid grid-cols-2 gap-4">
                      <select name="employeeId" onChange={handleInputChange} className="col-span-2 p-3 border rounded-lg" required>
                          <option value="">Select Employee</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pay Period Start</label>
                        <input name="payPeriodStart" type="date" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                      </div>
                       <div>
                        <label className="text-sm font-medium text-gray-600">Pay Period End</label>
                        <input name="payPeriodEnd" type="date" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                      </div>
                      <div className="col-span-2 flex justify-end gap-4 pt-4">
                          <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600">Generate</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}