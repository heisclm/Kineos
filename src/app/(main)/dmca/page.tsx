/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: 'DMCA Notice',
  description: 'Digital Millennium Copyright Act (DMCA) Notice and Takedown Procedure for Kineos.',
};

export default function DMCAPolicy() {
  return (
    <div className="w-full min-h-screen pt-3 sm:pt-4 md:pt-5 pb-16 px-4 sm:px-6 md:px-10 max-w-4xl mx-auto">
      {/* Top Left Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "DMCA Notice" },
        ]}
        className="mb-6 sm:mb-8"
      />

      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">DMCA Copyright Policy</h1>
        <p className="text-muted-foreground text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-10 text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty">
        <section className="space-y-4">
          <p>Kineos ("we," "our," or "us") respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement committed using the Kineos website (https://www.kineos.fun) that are reported to our Designated Copyright Agent.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">Content Disclaimer</h2>
          <p>Please note that Kineos acts solely as an indexer and cataloging service. We do not host, upload, or manage any video files, media files, or copyrighted material on our own servers. All content is indexed automatically or provided by third-party services and APIs. Regardless, we take copyright infringement claims very seriously and will remove indexed metadata or links pointing to infringing material upon receipt of a valid DMCA notice.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">Filing a DMCA Notice</h2>
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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3">Where to Send the Notice</h2>
          <p>Deliver this Notice, with all items completed, to our Designated Agent by visiting our <a href="/contact" className="text-primary hover:underline">Contact Page</a> or emailing us directly.</p>
          <p>Upon receipt of a valid DMCA Notice, we will review the claim and take appropriate action, including the removal of the reported content or links from our database.</p>
        </section>
      </div>
    </div>
  );
}
