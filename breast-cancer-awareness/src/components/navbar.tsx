'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { StackingNavbar } from '@/components/ui/stacking-navbar';

export function Navbar() {
  const { user, logout, loginAs } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-pink-600 hover:text-pink-700 transition-colors">
          <span className="text-2xl">🎗️</span>
          <span>Sangini</span>
        </Link>

        {/* Desktop links - Stacking Navbar */}
        <div className="hidden md:flex items-center">
          <StackingNavbar />
        </div>

        {/* Auth / Demo */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-medium capitalize">
                {user.role}: {user.name}
              </span>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                Login
              </Link>
              <div className="relative">
                <button
                  onClick={() => setDemoOpen(!demoOpen)}
                  className="bg-pink-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  Demo ▾
                </button>
                {demoOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-pink-100 py-2 z-50">
                    {(['patient', 'doctor', 'volunteer', 'admin'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => { loginAs(role); setDemoOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 capitalize"
                      >
                        Login as {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-pink-50 px-4 py-3 space-y-2">
          <Link href="/assessment" className="block py-2 text-gray-700 hover:text-pink-600" onClick={() => setMenuOpen(false)}>Self-Assessment</Link>
          {user?.role === 'doctor' && (
            <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-pink-600" onClick={() => setMenuOpen(false)}>Doctor Dashboard</Link>
          )}
          <Link href="/appointments" className="block py-2 text-gray-700 hover:text-pink-600" onClick={() => setMenuOpen(false)}>Appointments</Link>
          <Link href="/chat" className="block py-2 text-gray-700 hover:text-pink-600" onClick={() => setMenuOpen(false)}>Support Chat</Link>
          <Link href="/conclave" className="block py-2 text-gray-700 hover:text-pink-600" onClick={() => setMenuOpen(false)}>Conclave</Link>
          {user ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left py-2 text-red-500">Logout ({user.name})</button>
          ) : (
            <div className="space-y-1 pt-2 border-t border-pink-50">
              <Link href="/login" className="block py-2 text-pink-600 font-medium" onClick={() => setMenuOpen(false)}>
                Login / Sign Up
              </Link>
              <p className="text-xs text-gray-400 font-medium">Quick Demo:</p>
              {(['patient', 'doctor', 'volunteer', 'admin'] as const).map(role => (
                <button key={role} onClick={() => { loginAs(role); setMenuOpen(false); }} className="block w-full text-left py-1.5 text-sm text-gray-700 hover:text-pink-600 capitalize">
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
