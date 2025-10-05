import { Building, Stethoscope, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface LoginProps {
  setLoginType: (_type: string | null) => void;
  setLoginPortal: (_portal: string | null) => void;
}

export default function Login({ setLoginType, setLoginPortal }: LoginProps) {
  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 animate-gradient-x"></div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        onClick={() => setLoginPortal(null)}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-700 hover:text-black transition-colors z-10"
      >
        <ArrowLeft size={20} /> Back to Portal Selection
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center p-10 bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 z-10"
      >
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
          Staff Portal
        </h1>
        <p className="text-gray-700 mb-12 text-xl">
          ✨ Please select your role to continue ✨
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-12">
          <motion.button
            onClick={() => setLoginType("admin")}
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group flex flex-col items-center justify-center w-52 h-52 rounded-3xl shadow-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white overflow-hidden"
          >
            {/* Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 animate-pulse"
            ></motion.div>
            <Building className="w-16 h-16 mb-4 z-10" />
            <span className="text-xl font-bold z-10">Admin Login</span>
          </motion.button>

          <motion.button
            onClick={() => setLoginType("doctor")}
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group flex flex-col items-center justify-center w-52 h-52 rounded-3xl shadow-lg bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 text-white overflow-hidden"
          >
            {/* Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-lime-400 to-green-600 animate-pulse"
            ></motion.div>
            <Stethoscope className="w-16 h-16 mb-4 z-10" />
            <span className="text-xl font-bold z-10">Doctor Login</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Extra Floating Blobs for Decoration */}
      <div className="absolute w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
}
