import React from 'react';
import { FileText, Shield, RotateCcw, Package2, Phone } from 'lucide-react';

export function Footer() {
  const links = [
    {
      title: 'Terms and Conditions',
      icon: FileText,
      href: 'https://merchant.razorpay.com/policy/NK3JSdloLE94yc/terms'
    },
    {
      title: 'Privacy Policy',
      icon: Shield,
      href: 'https://merchant.razorpay.com/policy/NK3JSdloLE94yc/privacy'
    },
    {
      title: 'Cancellations and Refunds',
      icon: RotateCcw,
      href: 'https://merchant.razorpay.com/policy/NK3JSdloLE94yc/refund'
    },
    {
      title: 'Shipping Policy',
      icon: Package2,
      href: 'https://merchant.razorpay.com/policy/NK3JSdloLE94yc/shipping'
    },
    {
      title: 'Contact Us',
      icon: Phone,
      href: 'https://merchant.razorpay.com/policy/NK3JSdloLE94yc/contact_us'
    }
  ];

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{link.title}</span>
              </a>
            );
          })}
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SaaS Documentation AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}