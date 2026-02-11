"use client";

import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  ClipboardCheck,
  Stethoscope,
  CalendarDays,
  MessageCircleHeart,
  Users,
} from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  area: string;
}

const features: FeatureItem[] = [
  {
    icon: <ClipboardCheck className="size-6 text-pink-600" />,
    title: "Self Assessment",
    description:
      "Quick questions. Zero judgement. Smart insights. Get an instant, explainable risk score with clear next steps.",
    href: "/assessment",
    area: "md:[grid-area:1/1/2/7]",
  },
  {
    icon: <Stethoscope className="size-6 text-pink-600" />,
    title: "Doctor Smart Assist",
    description:
      "Doctors see AI-generated patient summaries, risk explanations, and suggested next actions. Keeps humans in the loop.",
    href: "/dashboard",
    area: "md:[grid-area:1/7/2/13]",
  },
  {
    icon: <CalendarDays className="size-6 text-pink-600" />,
    title: "Appointments",
    description:
      "Book doctor consultations with a simple calendar flow. Book it. Move it. No awkward calls.",
    href: "/appointments",
    area: "md:[grid-area:2/1/3/5]",
  },
  {
    icon: <MessageCircleHeart className="size-6 text-pink-600" />,
    title: "Support Chatbot",
    description:
      "Get emotional support, understand medical terms, and find your next steps.",
    href: "/chat",
    area: "md:[grid-area:2/5/3/9]",
  },
  {
    icon: <Users className="size-6 text-pink-600" />,
    title: "Smart Conclave",
    description:
      "Real stories. Safe space. You’re not alone. Post anonymously and connect with others.",
    href: "/conclave",
    area: "md:[grid-area:2/9/3/13]",
  },
];

export function FeatureGrid() {
  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl lg:text-5xl">
            How Sangini Helps
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-gray-500">
            Sangini helps you assess breast cancer risk through simple, explainable AI,
            and connects you to care, support, and community.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2">
          {features.map((feature) => (
            <li key={feature.title} className={`min-h-[14rem] list-none ${feature.area}`}>
              <Link href={feature.href} className="block h-full">
                <div className="relative h-full rounded-2xl border border-pink-100 p-2">
                  <GlowingEffect
                    spread={40}
                    glow
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-50">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
