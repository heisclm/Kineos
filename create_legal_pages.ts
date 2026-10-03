import fs from 'fs';
import path from 'path';

const SITE_NAME = "Kineos";
const SITE_URL = "https://kineos.com";

const privacyContent = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kineos',
  description: 'Privacy Policy for Kineos - Understanding how we collect, use, and protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full min-h-screen py-16 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 text-white/80 leading-relaxed text-justify">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>At {SITE_NAME}, accessible from {SITE_URL}, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by {SITE_NAME} and how we use it.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Log Files</h2>
          <p>{SITE_NAME} follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. Cookies and Web Beacons</h2>
          <p>Like any other website, {SITE_NAME} uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Google DoubleClick DART Cookie</h2>
          <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-primary hover:underline">https://policies.google.com/technologies/ads</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Advertising Partners Privacy Policies</h2>
          <p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on {SITE_NAME}, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>
          <p>Note that {SITE_NAME} has no access to or control over these cookies that are used by third-party advertisers.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Third Party Privacy Policies</h2>
          <p>{SITE_NAME}'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Contact Information</h2>
          <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}`;

const dmcaContent = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA & Copyright Policy | Kineos',
  description: 'Digital Millennium Copyright Act (DMCA) Notice and Takedown Procedure for Kineos.',
};

export default function DMCAPolicy() {
  return (
    <div className="w-full min-h-screen py-16 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">DMCA Copyright Policy</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 text-white/80 leading-relaxed text-justify">
        <section className="space-y-4">
          <p>{SITE_NAME} ("we," "our," or "us") respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement committed using the {SITE_NAME} website ({SITE_URL}) that are reported to our Designated Copyright Agent.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Content Disclaimer</h2>
          <p>Please note that {SITE_NAME} acts solely as an indexer and cataloging service. We do not host, upload, or manage any video files, media files, or copyrighted material on our own servers. All content is indexed automatically or provided by third-party services and APIs. Regardless, we take copyright infringement claims very seriously and will remove indexed metadata or links pointing to infringing material upon receipt of a valid DMCA notice.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Filing a DMCA Notice</h2>
          <p>If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to our Designated Agent.</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Identify the copyrighted work that you claim has been infringed.</li>
            <li>Identify the material or link you claim is infringing (or the subject of infringing activity) and to which access is to be disabled, including at a minimum, if applicable, the URL of the link shown on the Site or the exact location where such material may be found.</li>
            <li>Provide your corporate affiliation (if applicable), mailing address, telephone number, and, if available, email address.</li>
            <li>Include both of the following statements in the body of the Notice:
              <ul className="list-circle pl-6 mt-2 text-white/60">
                <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law."</li>
                <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
              </ul>
            </li>
            <li>Provide your full legal name and your electronic or physical signature.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Where to Send the Notice</h2>
          <p>Deliver this Notice, with all items completed, to our Designated Agent by visiting our <a href="/contact" className="text-primary hover:underline">Contact Page</a> or emailing us directly.</p>
          <p>Upon receipt of a valid DMCA Notice, we will review the claim and take appropriate action, including the removal of the reported content or links from our database.</p>
        </section>
      </div>
    </div>
  );
}`;

const termsContent = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Kineos',
  description: 'Terms of Service and User Agreement for Kineos.',
};

export default function TermsOfService() {
  return (
    <div className="w-full min-h-screen py-16 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 text-white/80 leading-relaxed text-justify">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using {SITE_URL} (the "Website"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our Website.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p>{SITE_NAME} provides a cataloging and indexing service for entertainment content. We do not host or store any media files or copyrighted material on our servers. The Website aggregates information, metadata, and third-party links for informational and entertainment purposes only.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. User Conduct</h2>
          <p>You agree to use the Website only for lawful purposes. You are prohibited from:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Using the Website in any way that breaches any applicable local, national, or international law or regulation.</li>
            <li>Attempting to gain unauthorized access to any portion or feature of the Website.</li>
            <li>Using automated systems (e.g., spiders, robots) to scrape or index our content without permission.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Third-Party Links & Ads</h2>
          <p>Our Website contains links to third-party websites and advertisements provided by networks like Google AdSense. We have no control over the content, privacy policies, or practices of any third-party sites or services. You acknowledge and agree that {SITE_NAME} shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with the use of any such content, goods, or services available on or through any such third-party web sites or services.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Disclaimer of Warranties</h2>
          <p>The Website is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Website or the information, content, or materials included on the Website.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Modifications</h2>
          <p>We reserve the right to modify these Terms at any time without prior notice. By continuing to use the Website after we post any modifications, you agree to be bound by the modified terms.</p>
        </section>
      </div>
    </div>
  );
}`;

const contactContent = `import { Metadata } from 'next';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Kineos',
  description: 'Get in touch with the Kineos team.',
};

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen py-16 px-6 md:px-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">Have a question, feedback, or need to file a DMCA notice? We'd love to hear from you.</p>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-surface/80 border border-white/5 shadow-md flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Mail className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Email Support</h3>
          <p className="text-white/60 text-sm">For all inquiries, including DMCA notices and partnership requests, please email us directly.</p>
        </div>

        <a 
          href="mailto:contact@kineos.com" 
          className="mt-4 w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          contact@kineos.com
        </a>
      </div>
    </div>
  );
}`;

function createPage(routePath: string, content: string) {
  const fullPath = path.join(process.cwd(), 'src/app/(main)', routePath);
  fs.mkdirSync(fullPath, { recursive: true });
  fs.writeFileSync(path.join(fullPath, 'page.tsx'), content);
  console.log('Created page:', routePath);
}

createPage('privacy', privacyContent);
createPage('dmca', dmcaContent);
createPage('terms', termsContent);
createPage('contact', contactContent);
