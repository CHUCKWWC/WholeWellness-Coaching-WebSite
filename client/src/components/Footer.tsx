import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const serviceLinks = [
  { href: "/services", label: "Domestic Violence Recovery" },
  { href: "/services", label: "Divorce & Widowhood Support" },
  { href: "/services", label: "Career Development" },
  { href: "/services", label: "Life Balance Coaching" },
  { href: "/services", label: "Relationship Coaching" },
];

const resourceLinks = [
  { href: "/programs", label: "Support Groups & Workshops" },
  { href: "/resources", label: "Article Library" },
  { href: "/resources?type=podcast", label: "Podcasts" },
  { href: "/events", label: "Upcoming Events" },
  { href: "/members", label: "Member Portal" },
];

const socialLinks = [
  { href: "https://facebook.com/wholewellnesscoaching", Icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com/wholewellnesscoaching", Icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com/company/wholewellnesscoaching", Icon: Linkedin, label: "LinkedIn" },
  { href: "https://twitter.com/wholewellness", Icon: Twitter, label: "Twitter/X" },
];

const contactDetails = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    lines: ["info@wholewellnesscoaching.org"],
    type: "email" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    lines: ["(210) 201-2422"],
    type: "phone" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    lines: ["12370 Potranco Rd", "Suite 207 PMB 1209", "San Antonio, TX 78253-4260"],
    type: "address" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    lines: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 2PM", "Sunday: Closed"],
    type: "hours" as const,
  },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Mobile Accordion Layout */}
        <div className="md:hidden space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-3">Wholewellness Coaching</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Empowering lives through accessible, high-quality coaching services for underserved communities.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 touch-target"
                  aria-label={label}
                  data-testid={`link-social-${label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          <Accordion type="multiple" className="w-full space-y-3">
            <AccordionItem value="services" className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <AccordionTrigger className="px-4 py-3 min-h-[48px] text-base font-semibold text-white touch-target" data-testid="accordion-services">
                Services
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-1 text-sm text-gray-200">
                  {serviceLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="inline-block py-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid={`link-service-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="resources" className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <AccordionTrigger className="px-4 py-3 min-h-[48px] text-base font-semibold text-white touch-target" data-testid="accordion-resources">
                Resources
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-1 text-sm text-gray-200">
                  {resourceLinks.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="inline-block py-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid={`link-resource-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="contact" className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <AccordionTrigger className="px-4 py-3 min-h-[48px] text-base font-semibold text-white touch-target" data-testid="accordion-contact">
                Contact & Hours
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3 text-sm text-gray-200">
                {contactDetails.map(({ icon, lines, type }, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 text-white/80">{icon}</span>
                    <div className="space-y-1">
                      {type === "email" ? (
                        <a 
                          href={`mailto:${lines[0]}`}
                          className="inline-block py-2 min-h-[48px] hover:text-white transition-colors touch-target"
                          data-testid="link-contact-email"
                        >
                          {lines[0]}
                        </a>
                      ) : type === "phone" ? (
                        <a 
                          href={`tel:${lines[0]}`}
                          className="inline-block py-2 min-h-[48px] hover:text-white transition-colors touch-target"
                          data-testid="link-contact-phone"
                        >
                          {lines[0]}
                        </a>
                      ) : (
                        lines.map((line) => (
                          <p key={line} className="py-1">{line}</p>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-6">Wholewellness Coaching</h3>
            <p className="text-gray-300 mb-6">
              Empowering lives through accessible, high-quality coaching services for underserved communities.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ href, Icon, label }) => (
                <a key={label} href={href} className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center text-white hover:text-primary transition-colors touch-target" aria-label={label} data-testid={`link-social-${label.toLowerCase()}`}>
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-1 text-gray-300">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-block py-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid={`link-service-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-1 text-gray-300">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-block py-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid={`link-resource-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-3 text-gray-300">
              {contactDetails.map(({ icon, lines, type }, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-white/80">{icon}</span>
                  <div className="space-y-1">
                    {type === "email" ? (
                      <a 
                        href={`mailto:${lines[0]}`}
                        className="hover:text-white transition-colors"
                        data-testid="link-contact-email-desktop"
                      >
                        {lines[0]}
                      </a>
                    ) : type === "phone" ? (
                      <a 
                        href={`tel:${lines[0].replace(/[^0-9+]/g, '')}`}
                        className="hover:text-white transition-colors"
                        data-testid="link-contact-phone-desktop"
                      >
                        {lines[0]}
                      </a>
                    ) : (
                      lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer Bottom - Always visible */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 mb-4 md:mb-0">
              © 2024 Wholewellness Coaching. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-gray-300 text-sm">
              <Link href="/privacy" className="inline-block py-3 px-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid="link-privacy">Privacy Policy</Link>
              <Link href="/terms" className="inline-block py-3 px-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid="link-terms">Terms of Service</Link>
              <Link href="/coach-signup" className="inline-block py-3 px-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid="link-become-coach">Become a Coach</Link>
              <Link href="/coach-profile" className="inline-block py-3 px-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid="link-coach-portal">Coaches Portal</Link>
              <Link href="/accessibility" className="inline-block py-3 px-2 hover:text-white transition-colors min-h-[48px] touch-target" data-testid="link-accessibility">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
