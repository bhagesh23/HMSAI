import { useState } from 'react';
import { Stethoscope, User, Briefcase } from 'lucide-react'; // Import icons for the buttons
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import EmployeeManagement from './components/EmployeeManagement';
import PharmacyManagement from './components/PharmacyManagement';
import AccountingModule from './components/AccountingModule';
import LaboratoryModule from './components/LaboratoryModule';
import MedicalRecordsModule from './components/MedicalRecordsModule';
import SurgicalModule from './components/SurgicalModule';
import PayrollModule from './components/PayrollModule';
import VendorModule from './components/VendorModule';
import InventoryModule from './components/InventoryModule';
import SMSModule from './components/SMSModule';
import PatientLogin from './components/patient/PatientLogin';
import PatientRegister from './components/patient/PatientRegister';
import PatientDashboard from './components/patient/PatientDashboard';
import StaffLogin from './components/StaffLogin';
import AppointmentsView from './components/AppointmentsView';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginPortal, setLoginPortal] = useState(null);
  const [patientAuthMode, setPatientAuthMode] = useState('login');

  const handleStaffLogin = (userObject) => {
    setLoggedInUser(userObject);
  };

  const handlePatientLogin = (patientObject) => {
    const patientWithRole = { ...patientObject, role: 'patient' };
    setLoggedInUser(patientWithRole);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginPortal(null);
    setPatientAuthMode('login');
    setActiveModule('dashboard');
  };

  if (!loggedInUser) {
    if (loginPortal === 'staff') {
      return <StaffLogin onLogin={handleStaffLogin} setLoginPortal={setLoginPortal} />;
    }

    if (loginPortal === 'patient') {
      if (patientAuthMode === 'login') {
        return <PatientLogin onLogin={handlePatientLogin} setAuthMode={setPatientAuthMode} setLoginPortal={setLoginPortal} />;
      }
      return <PatientRegister setAuthMode={setPatientAuthMode} setLoginPortal={setLoginPortal} />;
    }

    // --- NEW AND IMPROVED PORTAL SELECTION SCREEN ---
    return (
      <div className="relative flex flex-col items-center justify-center h-screen bg-landing overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-10 text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 animate-float">
          <div className="flex justify-center items-center mb-6">
            <Stethoscope className="w-12 h-12 text-white mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-white shadow-lg">
                Shree Medicare HMS
              </h1>
              <p className="text-white text-opacity-80 mt-2">Your dedicated partner in healthcare management.</p>
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-10">
            <button 
              onClick={() => setLoginPortal('staff')} 
              className="group flex flex-col items-center justify-center w-48 h-48 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <Briefcase className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xl font-bold">Staff Portal</span>
            </button>
            <button 
              onClick={() => setLoginPortal('patient')} 
              className="group flex flex-col items-center justify-center w-48 h-48 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <User className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xl font-bold">Patient Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loggedInUser.role === 'patient') {
    return <PatientDashboard patient={loggedInUser} onLogout={handleLogout} />;
  }

  const renderModule = () => {
    const isAdmin = loggedInUser.role === 'admin';
    const isDoctor = loggedInUser.role === 'doctor';

    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'patients': return <PatientManagement />;
      case 'pharmacy': return <PharmacyManagement />;
      case 'laboratory': return <LaboratoryModule />;
      case 'medical-records': return <MedicalRecordsModule />;
      case 'surgical': return <SurgicalModule />;
      case 'appointments': return isDoctor ? <AppointmentsView doctorId={loggedInUser.id} /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'employees': return isAdmin ? <EmployeeManagement /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'accounting': return isAdmin ? <AccountingModule /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'payroll': return isAdmin ? <PayrollModule /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'vendors': return isAdmin ? <VendorModule /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'inventory': return isAdmin ? <InventoryModule /> : <div className="p-4 text-red-500">Access Denied</div>;
      case 'sms': return isAdmin ? <SMSModule /> : <div className="p-4 text-red-500">Access Denied</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} userType={loggedInUser.role} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{renderModule()}</div>
      </main>
    </div>
  );
}

export default App;