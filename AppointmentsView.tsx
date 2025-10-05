import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Appointment } from '../types';
import { apiUrl } from '../config/api';

export default function AppointmentsView({ doctorId }: { doctorId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(apiUrl(`/api/appointments/doctor/${doctorId}`));
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.appointmentDate);
    const now = new Date();
    if (view === 'upcoming') {
      return appDate >= now && app.status === 'scheduled';
    }
    return appDate < now;
  }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
        My Appointments
      </h1>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex border-b mb-4">
          <button onClick={() => setView('upcoming')} className={`py-2 px-4 ${view === 'upcoming' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}>
            Upcoming
          </button>
          <button onClick={() => setView('past')} className={`py-2 px-4 ${view === 'past' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}>
            Past
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Patient</th>
                <th className="py-2">Date & Time</th>
                <th className="py-2">Department</th>
                <th className="py-2">Status</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => (
                <tr key={app.id} className="border-t hover:bg-gray-50">
                  <td className="py-4 font-medium">{app.patientName} ({app.patientId})</td>
                  <td className="py-4">{new Date(app.appointmentDate).toLocaleString()}</td>
                  <td className="py-4">{app.departmentName}</td>
                  <td className="py-4 capitalize">{app.status}</td>
                  <td className="py-4 text-sm text-gray-600">{app.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto w-12 h-12 mb-4" />
                No {view} appointments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}