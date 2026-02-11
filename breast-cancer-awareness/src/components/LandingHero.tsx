"use client"

import { Warp } from "@paper-design/shaders-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/types"

export default function LandingHero() {
  const { user, loginAs, logout } = useAuth()
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background shader */}
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={[
            "hsl(340, 100%, 20%)",
            "hsl(320, 100%, 75%)",
            "hsl(350, 90%, 30%)",
            "hsl(330, 100%, 80%)"
          ]}
        />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-white text-7xl md:text-8xl font-bold tracking-tight">
            Sangini
          </h1>
          <p className="text-white/90 text-xl md:text-2xl font-light italic -mt-4">
            Her Health. Her Strength.
          </p>

          {/* Authorization Component */}
          <div className="flex flex-col items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium capitalize border border-white/30">
                  {user.role}: {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/20 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDemoOpen(!demoOpen)}
                  className="px-8 py-4 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Sign In ▾
                </button>
                {demoOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 py-3 z-50">
                    {(['patient', 'doctor', 'volunteer', 'admin'] as const).map((role: UserRole) => (
                      <button
                        key={role}
                        onClick={() => { loginAs(role); setDemoOpen(false); }}
                        className="block w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 capitalize transition-colors"
                      >
                        Continue as {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-white/90 text-lg font-light">
            AI uniting care, diagnosis, support, and survival.
          </p>

          {/* Scroll hint */}
          <p className="text-white/60 text-sm mt-10 animate-bounce">
            Scroll to explore ↓
          </p>
        </div>
      </div>
    </section>
  )
}
