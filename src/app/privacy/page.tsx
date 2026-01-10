import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">Mechatronics</span>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 md:p-12">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-6">
                Mechatronics ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our IoT monitoring services and platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect the following types of information:
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Company/organization name and address</li>
                <li>Payment and billing information</li>
                <li>Account credentials</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Device Data</h3>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Water level readings and tank capacity</li>
                <li>Power consumption metrics</li>
                <li>Temperature and humidity readings</li>
                <li>Device status and connectivity information</li>
                <li>Location data (for device installation)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Provide and maintain our monitoring services</li>
                <li>Send alerts and notifications based on your preferences</li>
                <li>Process payments and manage subscriptions</li>
                <li>Improve our products and services</li>
                <li>Communicate with you about updates and support</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-600 mb-6">
                Your data is stored on secure cloud servers with industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
                <li><strong>Payment Processors:</strong> To process your transactions securely</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 mb-6">
                We retain your personal information for as long as your account is active or as needed to provide services. Device telemetry data is retained for up to 2 years for historical analysis. You may request deletion of your data at any time.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-6">
                Our platform uses cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-600 mb-6">
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600 mb-6">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-600 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-600 mb-6">
                For questions about this Privacy Policy or to exercise your rights, please contact us at:<br />
                Email: privacy@mechatronics.com.gh<br />
                Address: 123 Innovation Drive, East Legon, Accra, Ghana<br />
                Phone: +233 XX XXX XXXX
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Mechatronics. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
