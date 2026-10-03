/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
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
          href="mailto:contact@kineos.fun" 
          className="mt-4 w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          contact@kineos.fun
        </a>
      </div>
    </div>
  );
}