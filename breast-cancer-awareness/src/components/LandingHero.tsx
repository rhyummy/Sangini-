"use client"

import { Warp } from "@paper-design/shaders-react"
import { FormEvent, useState } from "react"

export default function LandingHero() {
  const [email, setEmail] = useState<string>("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    // Handle email submission
    console.log("Email submitted:", email)
  }

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
          <h1 className="text-white text-6xl md:text-7xl font-light italic">
            Empowering Women Through Early Detection
          </h1>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Get updates & early access"
              className="w-full px-6 py-4 pr-20 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              required
              aria-label="Email address for updates"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Submit email"
            >
              →
            </button>
          </form>

          <p className="text-white/90 text-lg font-light">
            AI-powered breast health awareness, screening guidance,
            <br /> and support — built for women, doctors, and volunteers.
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
