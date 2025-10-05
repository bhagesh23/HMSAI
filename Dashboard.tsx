import React, { useState, useEffect } from 'react';
import apiUrl from '../config/api';
import { Activity, Users, Pill, DollarSign, Bed, Stethoscope, Calendar, TrendingUp, Scissors } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <div className={`${color} rounded-2xl p-6 shadow-lg transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl card-hover relative overflow-hidden group`}>
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-white text-opacity-90 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-white text-3xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">{value}</h3>
        {trend && (
          <div className="flex items-center text-white text-opacity-90 text-xs">
            <TrendingUp className="w-3 h-3 mr-1 animate-bounce" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
        {icon}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeStaff: 0,
    availableBeds: 0,
    appointmentsToday: 0,
    labTestsToday: 0,
    revenue: 0,
    surgeriesToday: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
  const response = await fetch(apiUrl('/api/dashboard/stats'));
      const data = await response.json();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: <Users className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff.toLocaleString(),
      icon: <Stethoscope className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
      title: 'Available Beds',
      value: stats.availableBeds.toLocaleString(),
      icon: <Bed className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
    {
      title: 'Appointments Today',
      value: stats.appointmentsToday.toLocaleString(),
      icon: <Calendar className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-orange-500 to-amber-500',
    },
    {
      title: 'Lab Tests Today',
      value: stats.labTestsToday.toLocaleString(),
      icon: <Activity className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
    },
    {
      title: 'Surgeries Today',
      value: stats.surgeriesToday.toLocaleString(),
      icon: <Scissors className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-sky-500 to-blue-600',
    },
    {
      title: 'Revenue (Paid)',
      value: `$${Number(stats.revenue).toLocaleString()}`,
      icon: <DollarSign className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
    },
     // You can add another card here if you like
    {
      title: 'Pharmacy Stock',
      value: '98%', // This is a placeholder as it's a complex calculation
      icon: <Pill className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's a live look at the hospital's status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>
    </div>
  );
}