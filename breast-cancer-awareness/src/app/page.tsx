'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';
import LandingHero from '@/components/LandingHero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { CTASection } from '@/components/ui/cta-section';
import { Glow, CursorGlow } from '@/components/ui/glow';
import { Ribbon } from 'lucide-react';

// Floating Orb Component
function FloatingOrb({ 
  className, 
  color, 
  size, 
  delay = 0 
}: { 
  className?: string
  color: string
  size: string
  delay?: number 
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        background: color,
        width: size,
        height: size,
        animation: `float ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

// Canvas Particle Background
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const createParticles = () => {
      particles.length = 0
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.3 + 0.1,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(236, 72, 153, ${particle.opacity})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    createParticles()
    animate()

    window.addEventListener("resize", () => {
      resize()
      createParticles()
    })

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

export default function HomePage() {
  const { user } = useAuth();
  const [heroVisible, setHeroVisible] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // Once user scrolls past 80% of viewport, slide hero up
      if (scrollY > vh * 0.3) {
        setHeroVisible(false);
      } else {
        setHeroVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(8px); }
          50% { transform: translateY(-8px) translateX(-8px); }
          75% { transform: translateY(-20px) translateX(4px); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.15); }
          50% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(236, 72, 153, 0.25); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-fade-in-up-delay-1 {
          animation: fade-in-up 0.6s ease-out 0.15s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-3 {
          animation: fade-in-up 0.6s ease-out 0.45s forwards;
          opacity: 0;
        }
        .glow-button {
          animation: glow-pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Landing Hero - slides up on scroll */}
      <div
        className="fixed inset-0 z-50 transition-transform duration-700 ease-in-out"
        style={{ transform: heroVisible ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <LandingHero />
      </div>

      {/* Spacer to enable scrolling past the hero */}
      <div className="h-screen" />

      {/* Cursor-following glow */}
      <CursorGlow />

      {/* Main content */}
      <div ref={mainRef} className="relative min-h-screen w-full">
        
      {/* Hero Section - Premium Redesign */}
      <section className="relative z-10 py-24 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-rose-50 to-white" />
        
        {/* Floating Gradient Orbs */}
        <FloatingOrb
          className="top-[5%] left-[5%] opacity-40"
          color="radial-gradient(circle, rgba(251,207,232,0.8) 0%, rgba(251,207,232,0) 70%)"
          size="300px"
          delay={0}
        />
        <FloatingOrb
          className="top-[20%] right-[10%] opacity-30"
          color="radial-gradient(circle, rgba(244,114,182,0.6) 0%, rgba(244,114,182,0) 70%)"
          size="250px"
          delay={2}
        />
        <FloatingOrb
          className="bottom-[10%] left-[15%] opacity-35"
          color="radial-gradient(circle, rgba(253,164,175,0.7) 0%, rgba(253,164,175,0) 70%)"
          size="200px"
          delay={1}
        />

        {/* Particle Background */}
        <ParticleBackground />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Ribbon Icon with Glass Container */}
          {mounted && (
            <div className="animate-fade-in-up flex justify-center mb-8">
              <div
                className="relative p-4 rounded-2xl backdrop-blur-sm bg-white/40 border border-pink-100/50 shadow-lg"
                style={{ animation: "float-icon 4s ease-in-out infinite" }}
              >
                <Ribbon className="w-12 h-12 text-amber-500 drop-shadow-md" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl blur-xl bg-amber-200/30 -z-10" />
              </div>
            </div>
          )}

          {/* Headline with Gradient Text */}
          {mounted && (
            <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Early Awareness{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
                Saves Lives
              </span>
            </h1>
          )}

          {/* Subtext in Glass Card */}
          {mounted && (
            <div className="animate-fade-in-up-delay-2 mb-10">
              <div className="inline-block px-6 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-pink-100/50 shadow-sm">
                <p className="text-lg text-gray-600">
                  Know your risk. Trust the AI. Turn awareness into action.
                </p>
              </div>
            </div>
          )}

          {/* CTA Buttons with Glow */}
          {mounted && (
            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/assessment"
                className="glow-button bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-105 shadow-xl shadow-pink-200/50"
              >
                Take Self-Assessment
              </Link>
              <Link
                href="/chat"
                className="backdrop-blur-sm bg-white/70 text-pink-600 border-2 border-pink-200/70 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:border-pink-300 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Talk to Support Bot
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
      </section>

      {/* Features Grid with Glowing Effect */}
      <FeatureGrid />

      {/* CTA Section */}
      <CTASection
        title="Ready to take the first step?"
        action={{ text: "Start Self-Assessment", href: "/assessment" }}
      />

      {/* How It Works */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It <span className="text-pink-600">Works</span>
          </h2>
          <div className="space-y-8">
            <Step number={1} title="Take the Assessment" description="Answer questions about your risk factors (40% weight) and symptoms from breast self-examination (60% weight). Takes about 3 minutes." />
            <Step number={2} title="Get Your Risk Score" description="Receive an instant risk level (Low / Moderate / High) with plain-language explanations of what contributed to your score." />
            <Step number={3} title="Follow Clear Next Steps" description="Low risk? Continue routine screening. Moderate? Schedule a clinical exam. High? Consult a doctor promptly. We guide you at every level." />
            <Step number={4} title="Connect with Support" description="Book appointments, chat with our support bot, or join the community forum for peer support and expert guidance." />
          </div>
        </div>
      </section>

      {/* Quick Demo Login */}
      {!user && (
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Try the Demo</h2>
            <p className="text-gray-600 mb-6">
              Use the <strong>Demo Login</strong> button in the navigation bar to explore the platform as a Patient, Doctor, Volunteer, or Admin.
            </p>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
