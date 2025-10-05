import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import { Employee, Department } from '../types';
import { apiUrl } from '../config/api';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<'add' | 'details' | 'edit' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '', lastName: '', email: '', password: '', phone: '', departmentId: '', position: '', role: 'staff', hireDate: '', salary: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/employees')),
        fetch(apiUrl('/api/employees/departments'))
  ]).then(async ([employeesRes, departmentsRes]) => {
      const employeesData = await employeesRes.json();
      const departmentsData = await departmentsRes.json();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    }).catch(error => {
      console.error("Failed to fetch initial data:", error);
      alert("Could not load employee data. Please check the server connection.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchEmployees = async () => {
    try {
  const response = await fetch(apiUrl('/api/employees'));
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
  } catch (error) { console.error('Failed to fetch employees:', error); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, formType?: string) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    if (formType === 'new') {
      setNewEmployee(prevState => ({ ...prevState, [name]: value }));
    } else if (selectedEmployee) {
      setSelectedEmployee((prevState: Employee | null) => prevState ? ({ ...prevState, [name]: value } as Employee) : prevState);
    }
  };

  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmployee.password) {
      alert("Password is required.");
      return;
    }
    try {
  const response = await fetch(apiUrl('/api/employees/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      const data = await response.json();
      if (data.success) {
        alert('Employee added successfully!');
        setModal(null);
        fetchEmployees();
      } else { alert(data.message); }
  } catch (error) { console.error('Failed to connect to the server.', error); alert('Failed to connect to the server.'); }
  };

  const handleUpdateEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
  const response = await fetch(apiUrl(`/api/employees/${selectedEmployee.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEmployee),
      });
      const data = await response.json();
      if (data.success) {
        alert('Employee updated!');
        setModal(null);
        fetchEmployees();
      } else { alert(data.message); }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
  const response = await fetch(apiUrl(`/api/employees/${employeeId}`), { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          alert('Employee deleted!');
          fetchEmployees();
        } else { alert(data.message); }
  } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
    }
  };

  const openModal = (type: 'add' | 'details' | 'edit' | null, employee: Employee | null = null) => {
    setModal(type);
    if (employee) setSelectedEmployee(JSON.parse(JSON.stringify(employee)) as Employee);
    if (type === 'add') {
      setNewEmployee({
        employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '', lastName: '', email: '', password: '', phone: '', departmentId: '', position: '', role: 'staff', hireDate: '', salary: '',
      });
    }
  };

  const filteredEmployees = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.employeeId}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      case 'on_leave': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <div>Loading Employee Data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-2">Manage staff and assignments</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </td>
                  <td className="px-6 py-4">{employee.departmentName}</td>
                  <td className="px-6 py-4 capitalize">{employee.role}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>{employee.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => openModal('details', employee)} title="View Details"><Eye className="w-5 h-5 text-blue-600"/></button>
                      <button onClick={() => openModal('edit', employee)} title="Edit"><Edit2 className="w-5 h-5 text-green-600"/></button>
                      <button onClick={() => handleDeleteEmployee(employee.id)} title="Delete"><Trash2 className="w-5 h-5 text-red-600"/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {modal === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-4">
                <input name="firstName" onChange={(e) => handleInputChange(e, 'new')} placeholder="First Name" className="p-2 border rounded-lg" required />
                <input name="lastName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Last Name" className="p-2 border rounded-lg" required />
                <input type="email" name="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email (for login)" className="p-2 border rounded-lg" required />
                <input type="password" name="password" onChange={(e) => handleInputChange(e, 'new')} placeholder="Password" className="p-2 border rounded-lg" required />
                <input name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone" className="p-2 border rounded-lg" />
                <select name="departmentId" onChange={(e) => handleInputChange(e, 'new')} className="p-2 border rounded-lg" required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input name="position" onChange={(e) => handleInputChange(e, 'new')} placeholder="Position" className="p-2 border rounded-lg" required />
                <select name="role" value={newEmployee.role} onChange={(e) => handleInputChange(e, 'new')} className="p-2 border rounded-lg" required>
                    <option value="staff">Staff</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                </select>
                <input type="date" name="hireDate" onChange={(e) => handleInputChange(e, 'new')} className="p-2 border rounded-lg" required />
                <input type="number" name="salary" step="0.01" onChange={(e) => handleInputChange(e, 'new')} placeholder="Salary" className="p-2 border rounded-lg" required />
                <div className="col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">Add Employee</button>
                </div>
            </form>
          </div>
        </div>
      )}
      
      {modal === 'edit' && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Employee Details</h2>
            <form onSubmit={handleUpdateEmployee} className="grid grid-cols-2 gap-6">
                <input name="firstName" value={selectedEmployee.firstName} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <input name="lastName" value={selectedEmployee.lastName} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <input name="email" value={selectedEmployee.email} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <input name="phone" value={selectedEmployee.phone} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <select name="departmentId" value={selectedEmployee.departmentId} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input name="position" value={selectedEmployee.position} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <input name="salary" value={selectedEmployee.salary} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg"/>
                <select name="status" value={selectedEmployee.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-2 border rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                </select>

                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Reset Password (leave blank to keep current password)</p>
                  <input 
                    type="password"
                    name="password"
                    placeholder="New Password"
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div className="col-span-2 flex justify-end gap-4">
                    <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Save Changes</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'details' && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {selectedEmployee.employeeId}</p>
                  <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  <p><strong>Department:</strong> {departments.find(d => d.id == selectedEmployee.departmentId)?.name}</p>
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
                  <p><strong>Status:</strong> {selectedEmployee.status}</p>
                  <p><strong>Salary:</strong> ${Number(selectedEmployee.salary).toLocaleString()}</p>
                </div>
                <button onClick={() => setModal(null)} className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg">Close</button>
            </div>
        </div>
      )}
    </div>
  );
}