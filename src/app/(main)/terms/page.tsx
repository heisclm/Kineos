/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and User Agreement for Kineos.',
};

export default function TermsOfService() {
  return (
    <div className="w-full min-h-screen py-10 sm:py-16 px-6 md:px-10 max-w-4xl mx-auto">
      {/* Top Left Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
        className="mb-8"
      />

      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-10 text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty">
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using https://www.kineos.fun (the "Website"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our Website.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">2. Description of Service</h2>
          <p>Kineos provides a cataloging and indexing service for entertainment content. We do not host or store any media files or copyrighted material on our servers. The Website aggregates information, metadata, and third-party links for informational and entertainment purposes only.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">3. User Conduct</h2>
          <p>You agree to use the Website only for lawful purposes. You are prohibited from:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Using the Website in any way that breaches any applicable local, national, or international law or regulation.</li>
            <li>Attempting to gain unauthorized access to any portion or feature of the Website.</li>
            <li>Using automated systems (e.g., spiders, robots) to scrape or index our content without permission.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">4. Third-Party Links & Ads</h2>
          <p>Our Website contains links to third-party websites and advertisements provided by third-party advertising partners. We have no control over the content, privacy policies, or practices of any third-party sites or services. You acknowledge and agree that Kineos shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with the use of any such content, goods, or services available on or through any such third-party web sites or services.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">5. Disclaimer of Warranties</h2>
          <p>The Website is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Website or the information, content, or materials included on the Website.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">6. Modifications</h2>
          <p>We reserve the right to modify these Terms at any time without prior notice. By continuing to use the Website after we post any modifications, you agree to be bound by the modified terms.</p>
        </section>
      </div>
    </div>
  );
}
