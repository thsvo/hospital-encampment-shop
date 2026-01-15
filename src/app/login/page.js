"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (data.success) {
        router.push("/admin");
        router.refresh(); // Refresh to ensure middleware/cookies are picked up
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-serif text-2xl font-bold text-secondary mb-2">
            BioVibe<span className="text-primary">.</span>
          </Link>
          <h2 className="text-gray-500 text-sm font-medium">Restricted Access</h2>
        </div>

        <h1 className="text-2xl font-bold text-secondary mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20">
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
                &larr; Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
