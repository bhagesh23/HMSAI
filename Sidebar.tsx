import {
  LayoutDashboard, Users, UserCog, Pill, DollarSign, Activity,
  FileText, Stethoscope, Scissors, CreditCard, Package, MessageSquare,
  ChevronRight, LogOut, Calendar
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (_module: string) => void;
  userType: 'admin' | 'doctor';
  onLogout: () => void;
}

export default function Sidebar({ activeModule, setActiveModule, userType, onLogout }: SidebarProps) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'patients', label: 'Patients', icon: Users, color: 'text-pink-500' },
    { id: 'employees', label: 'Employees', icon: UserCog, color: 'text-blue-500' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-teal-500' },
    { id: 'accounting', label: 'Accounting', icon: DollarSign, color: 'text-red-500' },
    { id: 'laboratory', label: 'Laboratory', icon: Activity, color: 'text-violet-500' },
    { id: 'medical-records', label: 'Medical Records', icon: FileText, color: 'text-green-500' },
    { id: 'surgical', label: 'Surgical', icon: Scissors, color: 'text-orange-500' },
    { id: 'payroll', label: 'Payroll', icon: CreditCard, color: 'text-cyan-500' },
    { id: 'vendors', label: 'Vendors', icon: Package, color: 'text-amber-500' },
    { id: 'inventory', label: 'Inventory', icon: Package, color: 'text-sky-500' },
    { id: 'sms', label: 'SMS & Reports', icon: MessageSquare, color: 'text-rose-500' },
  ];

  const doctorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, color: 'text-orange-500' },
    { id: 'patients', label: 'Patients', icon: Users, color: 'text-pink-500' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-teal-500' },
    { id: 'laboratory', label: 'Laboratory', icon: Activity, color: 'text-violet-500' },
    { id: 'medical-records', label: 'Medical Records', icon: FileText, color: 'text-green-500' },
    { id: 'surgical', label: 'Surgical', icon: Scissors, color: 'text-orange-500' },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : doctorMenuItems;

  return (
    <div className="w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 h-screen flex flex-col shadow-xl animate-slide-in-left">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Shree Medicare
            </h1>
            <p className="text-xs text-gray-500">Hospital Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group transform hover:scale-105 animate-slide-up ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : item.color} ${isActive ? 'animate-bounce-in' : 'group-hover:scale-110'}`} />
                <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-5 h-5 text-white animate-pulse" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 font-semibold hover:bg-red-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <LogOut size={20} className="transition-transform duration-300 group-hover:rotate-12" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}