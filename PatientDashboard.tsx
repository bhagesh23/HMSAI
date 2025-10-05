import React, { useState, useEffect, useRef } from 'react';
import { Calendar, FileText, DollarSign, LogOut, Plus, X, User, Clock, Bell, Pill, Edit, Beaker, Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Patient, Appointment, MedicalRecord, AccountReceivable, Employee, LabTest, Prescription } from '../types';
import TriageChatModal from '../TriageChatModal';
import AIAssistantModal from '../AIAssistantModal';
import apiUrl from '../../config/api';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <motion.div 
    className={`p-6 rounded-2xl shadow-lg text-white ${color}`}
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="p-3 bg-white bg-opacity-20 rounded-full">
        {icon}
      </div>
    </div>
  </motion.div>
);

type PatientDashboardProps = {
  patient: any;
  onLogout: () => void;
};

export default function PatientDashboard({ patient, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [billing, setBilling] = useState<AccountReceivable[]>([]);
  const [doctors, setDoctors] = useState<Employee[]>([]);
  const [labResults, setLabResults] = useState<LabTest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [newAppointment, setNewAppointment] = useState({ doctorId: '', appointmentDate: '', notes: '' });
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [simplification, setSimplification] = useState<{ record: MedicalRecord | null, text: string, loading: boolean }>({ record: null, text: '', loading: false });

  const fetchAllData = () => {
    if (!patient || !patient.id) return;
    const patientId = patient.id;
    Promise.all([
      fetch(apiUrl(`/api/patients/${patientId}`)),
      fetch(apiUrl(`/api/portal/my-appointments/${patientId}`)),
      fetch(apiUrl(`/api/portal/my-records/${patientId}`)),
      fetch(apiUrl(`/api/portal/my-billing/${patientId}`)),
      fetch(apiUrl(`/api/portal/my-lab-results/${patientId}`)),
      fetch(apiUrl(`/api/portal/my-prescriptions/${patientId}`)),
      fetch(apiUrl('/api/employees'))
    ]).then(async ([patientRes, appointmentsRes, recordsRes, billingRes, labRes, prescRes, doctorsRes]) => {
        setPatientDetails(await patientRes.json());
        setAppointments(await appointmentsRes.json());
        setRecords(await recordsRes.json());
        setBilling(await billingRes.json());
        setLabResults(await labRes.json());
        setPrescriptions(await prescRes.json());
        setDoctors(await doctorsRes.json());
  }).catch(error => { console.error("Failed to fetch patient data:", error); });
  };

  useEffect(() => {
    fetchAllData();
  }, [patient.id]);

  const handleSimplifyRecord = async (record: MedicalRecord) => {
    setSimplification({ record, text: '', loading: true });
    try {
      const res = await fetch(apiUrl('/api/ai/simplify-record'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis: record.diagnosis, treatment: record.treatment }),
      });
      const data = await res.json();
      setSimplification({ record, text: data.reply, loading: false });
    } catch (error) {
      console.error('Failed to simplify record:', error);
      setSimplification({ record, text: 'Could not connect to the AI service.', loading: false });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePhoto', file);
    try {
  const response = await fetch(apiUrl(`/api/patients/${patient.id}/upload-photo`), {
            method: 'POST',
            body: formData,
        });
    const data = await response.json();
    if (data.success) {
      alert(data.message);
      setPatientDetails((prevDetails: Patient | null) => prevDetails ? ({...prevDetails, profileImageUrl: data.profileImageUrl}) : prevDetails);
    } else {
      alert(data.message);
    }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload photo.');
    }
  };

  const handleDetailsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(apiUrl(`/api/patients/${patient.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientDetails),
      });
      const data = await response.json();
      alert(data.message || 'Profile details updated!');
    } catch (error) {
      console.error('Failed to connect to the server.', error);
      alert('Failed to connect to the server.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & { currentPassword: { value: string }, newPassword: { value: string }, confirmPassword: { value: string }};
    if (target.newPassword.value !== target.confirmPassword.value) {
      alert("New passwords do not match.");
      return;
    }
    try {
  const response = await fetch(apiUrl('/api/auth/patient/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, currentPassword: target.currentPassword.value, newPassword: target.newPassword.value }),
      });
      const data = await response.json();
      alert(data.message);
      if (data.success) { (e.target as HTMLFormElement).reset(); }
  } catch (error) { console.error(error); alert('Failed to connect to the server.'); }
  };

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(apiUrl('/api/portal/book-appointment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAppointment, patientId: patient.id }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Appointment booked successfully!');
        setShowModal(false);
        fetchAllData();
      } else { alert(data.message); }
  } catch (error) { console.error(error); alert('Failed to connect to the server.'); }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
  const response = await fetch(apiUrl(`/api/portal/my-appointments/${appointmentId}/cancel`), { method: 'PUT' });
        const data = await response.json();
        if (data.success) {
          alert('Appointment canceled.');
          fetchAllData();
        } else { alert(data.message); }
    } catch (error) { console.error(error); alert('Failed to connect to server.'); }
    }
  };
  
  const handlePayBill = async (bill: { id: string; amount: number; invoiceNumber: string; }) => {
    const upiId = 'your-upi-id@okhdfcbank'; 
    const hospitalName = 'Shree Medicare Hospital';
    const amount = bill.amount.toFixed(2);
    const invoiceNumber = bill.invoiceNumber;
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(hospitalName)}&am=${amount}&tn=${encodeURIComponent(`Payment for Invoice ${invoiceNumber}`)}&cu=INR`;
    
    window.open(upiLink, '_blank');
    
    try {
  const response = await fetch(apiUrl(`/api/portal/my-billing/${bill.id}/pay`), {
            method: 'PUT',
        });
        const data = await response.json();
        if (data.success) {
            alert("Payment initiated! The bill status will be updated shortly.");
            fetchAllData();
        }
    } catch (error) {
        console.error("Failed to update payment status:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    const { name, value } = target;
    setNewAppointment(prevState => ({ ...prevState, [name]: value }));
  };

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text("Medical Record", 14, 22);
    doc.setFontSize(12);
    doc.text(`Patient: ${patientDetails?.firstName} ${patientDetails?.lastName}`, 14, 30);
    doc.text(`Patient ID: ${patientDetails?.patientId}`, 14, 36);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    // Add table using jspdf-autotable
    const tableColumn = ["Date", "Doctor", "Diagnosis", "Treatment"];
    const tableRows: (string | undefined)[][] = [];

    records.forEach(record => {
      const recordData = [
        record.recordDate ? new Date(record.recordDate).toLocaleDateString() : 'N/A',
        record.doctorName,
        record.diagnosis,
        record.treatment,
      ];
      tableRows.push(recordData);
    });

    (doc as any).autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`medical-record-${patientDetails?.patientId}.pdf`);
  };

  const nextAppointment = appointments.find(a => new Date(a.appointmentDate) > new Date() && a.status === 'scheduled');
  const lastVisit = appointments.sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()).find(a => new Date(a.appointmentDate) < new Date());
  const totalOwed = billing.filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'overdue').reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b text-center">
            <div className="relative w-24 h-24 mx-auto mb-2 group">
                <img src={patientDetails?.profileImageUrl ? `${apiUrl('')}${patientDetails.profileImageUrl}` : `https://ui-avatars.com/api/?name=${patientDetails?.firstName}+${patientDetails?.lastName}&background=random`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity cursor-pointer"><Edit className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" /></button>
            </div>
            <h1 className="text-lg font-bold text-gray-800">{patientDetails ? `${patientDetails.firstName} ${patientDetails.lastName}` : "Patient Portal"}</h1>
            <p className="text-xs text-gray-500">{patientDetails?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><FileText size={20} /> Dashboard</button>
            <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'appointments' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><Calendar size={20} /> My Visits</button>
            <button onClick={() => setActiveTab('records')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'records' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><FileText size={20} /> Medical History</button>
            <button onClick={() => setActiveTab('lab_results')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'lab_results' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><Beaker size={20} /> Lab Results</button>
            <button onClick={() => setActiveTab('prescriptions')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'prescriptions' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><Pill size={20} /> My Prescriptions</button>
            <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'billing' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><DollarSign size={20} /> Billing</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}><User size={20} /> My Profile</button>
        </nav>
        <div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><LogOut size={20} /> Logout</button></div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, {patientDetails?.firstName}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Visits" value={appointments.length} icon={<Calendar size={24} />} color="bg-gradient-to-br from-blue-400 to-blue-600" />
              <StatCard title="Last Visit" value={lastVisit ? new Date(lastVisit.appointmentDate).toLocaleDateString() : 'N/A'} icon={<Clock size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" />
              <StatCard title="Total Owed" value={`$${totalOwed.toFixed(2)}`} icon={<DollarSign size={24} />} color="bg-gradient-to-br from-red-400 to-red-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Reminders & Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Bell className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-yellow-800">Upcoming Appointment</p>
                      <p className="text-sm text-yellow-700">{nextAppointment ? `You have an appointment with ${nextAppointment.doctorName} on ${new Date(nextAppointment.appointmentDate).toLocaleDateString()}.` : 'No upcoming appointments.'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-800">Medication Reminder</p>
                      <p className="text-sm text-blue-700">Don't forget to take your prescribed medication at 8:00 PM.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Next Scheduled Visit</h3>
                {nextAppointment ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-blue-600">{new Date(nextAppointment.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-lg text-gray-700">{new Date(nextAppointment.appointmentDate).toLocaleTimeString()}</p>
                    <p className="text-sm text-gray-500">with {nextAppointment.doctorName}</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No upcoming appointments.</p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
        {activeTab === 'appointments' && ( <div className="animate-fade-in"><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800">My Visits</h2><div className="flex gap-4"><button onClick={() => setShowAIAssistant(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow">AI Assistant</button><button onClick={() => setShowTriageModal(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 shadow">Help Me Choose</button><button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 shadow"><Plus size={20} /> Book Appointment</button></div></div><div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">{appointments.length > 0 ? appointments.map(app => (<div key={app.id} className="p-4 rounded-lg border flex items-center justify-between"><div><p className="font-bold text-gray-800">{new Date(app.appointmentDate).toLocaleDateString()}</p><p className="text-sm text-gray-600">with {app.doctorName} ({app.departmentName})</p></div><div className="text-right"><p className={`font-semibold text-sm px-2 py-1 rounded-full ${app.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : app.status === 'canceled' ? 'bg-red-100 text-red-700' : 'bg_gray-100 text-gray-700'}`}>{app.status.toUpperCase()}</p>{app.status === 'scheduled' && new Date(app.appointmentDate) > new Date() && (<button onClick={() => handleCancelAppointment(app.id)} className="text-xs text-red-500 hover:underline mt-1">Cancel</button>)}</div></div>)) : <p className="text-center text-gray-500 py-8">You have no appointment history.</p>}</div></div> )}
        {activeTab === 'records' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Medical History</h2>
              <button onClick={handleGeneratePdf} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 shadow">
                  <Download size={20} />
                  Download PDF
              </button>
            </div>
            <div className="space-y-4">
              {records.length > 0 ? records.map((rec, i) => (
                <motion.div key={rec.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-lg border bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-gray-800">{rec.diagnosis}</p>
                    <p className="text-sm text-gray-500">{new Date(rec.recordDate).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>Doctor:</strong> {rec.doctorName}</p>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded"><strong>Treatment:</strong> {rec.treatment}</p>
                  <button onClick={() => handleSimplifyRecord(rec)} className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                    <Sparkles size={16} />
                    Simplify with AI
                  </button>
                </motion.div>
              )) : <p className="text-center text-gray-500 py-8">You have no medical history.</p>}
            </div>
          </motion.div>
        )}
        {activeTab === 'lab_results' && ( <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in"><h2 className="text-3xl font-bold text-gray-800 mb-6">My Lab Results</h2><div className="space-y-4">{labResults.length > 0 ? labResults.map(result => (<div key={result.id} className="p-4 rounded-lg border flex items-center justify-between"><div><p className="font-bold text-gray-800">{result.testName}</p><p className="text-sm text-gray-500">Date: {new Date(result.testDate).toLocaleDateString()}</p></div><p className={`font-semibold text-sm px-2 py-1 rounded-full ${result.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{result.status.toUpperCase()}</p></div>)) : <p className="text-center text-gray-500 py-8">You have no lab results.</p>}</div></div> )}
        {activeTab === 'prescriptions' && ( <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in"><h2 className="text-3xl font-bold text-gray-800 mb-6">My Prescriptions</h2><div className="space-y-4">{prescriptions.length > 0 ? prescriptions.map(presc => (<div key={presc.id} className="p-4 rounded-lg border"><div className="flex justify-between items-center mb-2"><p className="font-bold text-gray-800">Prescription from {presc.doctorName}</p><p className="text-sm text-gray-500">{new Date(presc.prescriptionDate).toLocaleDateString()}</p></div><p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{presc.notes || 'No specific notes.'}</p></div>)) : <p className="text-center text-gray-500 py-8">You have no prescriptions.</p>}</div></div> )}
        {activeTab === 'billing' && ( <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in"><h2 className="text-3xl font-bold text-gray-800 mb-6">Billing</h2><div className="space-y-4">{billing.length > 0 ? billing.map(bill => (<div key={bill.id} className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between"><div className="mb-4 sm:mb-0"><p className="font-bold text-gray-800">Invoice #{bill.invoiceNumber}</p><p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p></div><div className="flex items-center justify-between"><div className="text-left sm:text-right sm:mr-6"><p className="text-lg font-bold text-gray-800">$${Number(bill.amount).toFixed(2)}</p><p className={`font-semibold text-sm px-2 py-1 rounded-full inline-block ${bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{bill.paymentStatus.toUpperCase()}</p></div>{(bill.paymentStatus === 'pending' || bill.paymentStatus === 'overdue') && (<button onClick={() => handlePayBill(bill)} className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Pay with UPI</button>)}</div></div>)) : <p className="text-center text-gray-500 py-8">You have no billing history.</p>}</div></div> )}
        {activeTab === 'profile' && patientDetails && ( <div className="space-y-8 animate-fade-in"><h2 className="text-3xl font-bold text-gray-800">My Profile</h2><div className="bg-white p-6 rounded-2xl shadow-lg"><h3 className="font-bold text-lg mb-4">Personal Details</h3><form onSubmit={handleDetailsUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={patientDetails.firstName} onChange={e => setPatientDetails({...patientDetails, firstName: e.target.value})} placeholder="First Name" className="p-2 border rounded-lg" /><input value={patientDetails.lastName} onChange={e => setPatientDetails({...patientDetails, lastName: e.target.value})} placeholder="Last Name" className="p-2 border rounded-lg" /><input value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value})} placeholder="Phone" className="p-2 border rounded-lg" /><input value={patientDetails.address} onChange={e => setPatientDetails({...patientDetails, address: e.target.value})} placeholder="Address" className="p-2 border rounded-lg" /><div className="md:col-span-2"><button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save Changes</button></div></form></div><div className="bg-white p-6 rounded-2xl shadow-lg"><h3 className="font-bold text-lg mb-4">Change Password</h3><form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm"><input name="currentPassword" type="password" placeholder="Current Password" className="w-full p-2 border rounded-lg" required /><input name="newPassword" type="password" placeholder="New Password" className="w-full p-2 border rounded-lg" required /><input name="confirmPassword" type="password" placeholder="Confirm New Password" className="w-full p-2 border rounded-lg" required /><button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Change Password</button></form></div></div> )}
      </main>

      {simplification.record && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Simplified Explanation</h2>
              <button onClick={() => setSimplification({ record: null, text: '', loading: false })}><X size={24} /></button>
            </div>
            {simplification.loading ? (
              <div className="flex justify-center items-center h-24">
                <p className="text-gray-500 animate-pulse">AI is thinking...</p>
              </div>
            ) : (
              <p className="text-gray-700">{simplification.text}</p>
            )}
          </div>
        </div>
      )}

      {showModal && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 w-full max-w-md"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Book an Appointment</h2><button onClick={() => setShowModal(false)}><X size={24} /></button></div><form onSubmit={handleBookAppointment}><div className="mb-4"><label className="block text-sm font-medium mb-1">Doctor</label><select name="doctorId" onChange={handleInputChange} className="w-full p-2 border rounded" required><option value="">Select a Doctor</option>{doctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.firstName} {doc.lastName}</option>))}</select></div><div className="mb-4"><label className="block text-sm font-medium mb-1">Date and Time</label><input type="datetime-local" name="appointmentDate" onChange={handleInputChange} className="w-full p-2 border rounded" required /></div><div className="mb-4"><label className="block text-sm font-medium mb-1">Reason for Visit (Optional)</label><textarea name="notes" onChange={handleInputChange} className="w-full p-2 border rounded" rows={3}></textarea></div><button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">Book Appointment</button></form></div></div> )}
      {showTriageModal && <TriageChatModal onClose={() => setShowTriageModal(false)} />}
      {showAIAssistant && <AIAssistantModal onClose={() => setShowAIAssistant(false)} records={records} labResults={labResults} prescriptions={prescriptions} patientName={patientDetails ? `${patientDetails.firstName} ${patientDetails.lastName}` : ''} />}
    </div>
  );
}