'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';
import LandingHero from '@/components/LandingHero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { CTASection } from '@/components/ui/cta-section';
import { Glow, CursorGlow } from '@/components/ui/glow';

export default function HomePage() {
  const { user } = useAuth();
  const [heroVisible, setHeroVisible] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

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
      <div ref={mainRef} className="relative min-h-screen w-full bg-white">
        {/* Soft Pink Glow Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #fbcfe8 0%, transparent 70%)`,
            opacity: 0.5,
            mixBlendMode: 'multiply',
          }}
        />
        {/* Static Glow accents */}
        <Glow variant="top" className="z-0 opacity-40" />

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-6">🎗️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Early Awareness <span className="text-pink-600">Saves Lives</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Sangini helps you assess breast cancer risk through simple, explainable AI,
            and connects you to care, support, and community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment"
              className="bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
            >
              Take Self-Assessment
            </Link>
            <Link
              href="/chat"
              className="bg-white text-pink-600 border-2 border-pink-200 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-pink-50 transition-colors"
            >
              Talk to Support Bot
            </Link>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="mt-10 max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>⚠️ Important:</strong> This platform is for <strong>awareness and education only</strong>.
            It does not diagnose any medical condition. Always consult a qualified healthcare professional.
          </div>
        </div>
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
