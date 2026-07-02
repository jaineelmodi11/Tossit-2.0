import Link from "next/link";
import { AuthRedirect } from "@/components/AuthRedirect";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/siteConfig";

const FEATURES = [
  {
    emoji: "📸",
    title: "Instant classification",
    body: "Snap a photo or upload one. A machine-learning model tells you in seconds whether it's recycling, organic, or garbage - with a disposal tip.",
  },
  {
    emoji: "📊",
    title: "Live waste dashboard",
    body: "Your recycling rate, category breakdown, and 7-day trends update in real time with every scan.",
  },
  {
    emoji: "🕓",
    title: "Full scan history",
    body: "Every item you classify is logged with a timestamp, so you can actually see your habits change over time.",
  },
];

const STEPS = [
  { n: "1", title: "Scan it", body: "Point your camera at whatever you're about to throw away." },
  { n: "2", title: "Get the bin", body: "The model classifies it and tells you exactly which bin it belongs in." },
  { n: "3", title: "Watch your rate climb", body: "Every scan feeds your personal dashboard and recycling rate." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-[135deg] from-brand via-brand-dark to-brand-deep">
      <AuthRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Hero */}
        <header className="text-center mt-6">
          <h1 className="text-white text-5xl font-bold tracking-tight">TossIt</h1>
          <p className="text-white/80 text-lg mt-2">Smart waste classification</p>
        </header>

        <div className="flex flex-col items-center py-10">
          <div className="w-40 h-40 rounded-full bg-white/15 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-6xl">♻️</span>
            </div>
          </div>
          <p className="text-white/90 text-center mt-6 text-base leading-7 max-w-md">
            Take a photo of any waste item and instantly know whether it&apos;s
            recyclable, organic, or landfill - then watch your recycling rate
            improve on your personal dashboard.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <Link
            href="/auth/sign-up"
            className="block w-full text-center bg-white rounded-2xl py-4 font-bold text-brand text-lg shadow-md hover:bg-white/90 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/sign-in"
            className="block w-full text-center border-2 border-white/60 rounded-2xl py-4 font-bold text-white text-lg hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <section className="w-full mt-16">
          <h2 className="sr-only">Features</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ emoji, title, body }) => (
              <div key={title} className="bg-white/10 rounded-3xl p-5 backdrop-blur-sm">
                <div className="text-3xl mb-2">{emoji}</div>
                <h3 className="text-white font-bold text-base">{title}</h3>
                <p className="text-white/70 text-sm mt-1 leading-6">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="w-full mt-14 mb-8">
          <h2 className="text-white text-2xl font-bold text-center mb-6">
            How it works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="text-center px-2">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {n}
                </div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-white/70 text-sm mt-1 leading-6">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-white/50 text-xs pb-4">
          TossIt v2.1 · Built with ♻️
        </footer>
      </div>
    </div>
  );
}
