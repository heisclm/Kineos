/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Kineos - Understanding how we collect, use, and protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full min-h-screen py-10 sm:py-16 px-6 md:px-10 max-w-4xl mx-auto">
      {/* Top Left Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
        className="mb-8"
      />

      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-10 text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty">
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">1. Introduction</h2>
          <p>At Kineos, accessible from https://www.kineos.fun, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Kineos and how we use it.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">2. Log Files</h2>
          <p>Kineos follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">3. Cookies and Web Beacons</h2>
          <p>Like any other website, Kineos uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">4. Third-Party Cookies & Beacons</h2>
          <p>Third-party partners may use cookies or web beacons to understand usage trends and deliver relevant advertising content based upon visits to our site and other sites on the internet. Visitors may choose to decline or manage cookies through their individual browser settings or industry-standard opt-out tools.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">5. Advertising Partners Privacy Policies</h2>
          <p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Kineos, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>
          <p>Note that Kineos has no access to or control over these cookies that are used by third-party advertisers.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">6. Third Party Privacy Policies</h2>
          <p>Kineos's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">7. Contact Information</h2>
          <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}
