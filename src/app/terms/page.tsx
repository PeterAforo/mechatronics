import { WebsiteLayout, PageHeader } from "@/components/website";

export default function TermsPage() {
  return (
    <WebsiteLayout>
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated: January 2026"
        breadcrumbs={[{ label: "Terms of Service" }]}
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=600&fit=crop"
      />

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 md:p-12">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-6">
                By accessing and using Mechatronics services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
              <p className="text-gray-600 mb-6">
                Mechatronics provides IoT monitoring solutions including but not limited to water level monitoring, power consumption tracking, and temperature control systems. Our services include hardware devices, software platforms, and related support services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To access our services, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="text-gray-600 mb-4">
                Our services require payment of:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li><strong>Setup Fee:</strong> A one-time fee covering device and installation costs</li>
                <li><strong>Monthly Subscription:</strong> Recurring fee for monitoring and platform access</li>
              </ul>
              <p className="text-gray-600 mb-6">
                All fees are non-refundable unless otherwise stated. Failure to pay may result in service suspension.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Device Installation</h2>
              <p className="text-gray-600 mb-6">
                Installation is performed by our authorized technicians. You agree to provide safe access to installation locations and ensure necessary permissions are obtained. Devices remain the property of Mechatronics until fully paid for.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Availability</h2>
              <p className="text-gray-600 mb-6">
                While we strive for 99.9% uptime, we do not guarantee uninterrupted service. Factors beyond our control, including network outages, power failures, and natural disasters, may affect service availability.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Usage</h2>
              <p className="text-gray-600 mb-6">
                We collect and process data from your devices to provide our services. This data is used for monitoring, alerting, analytics, and service improvement. See our Privacy Policy for detailed information on data handling.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 mb-6">
                Mechatronics shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid by you in the preceding 12 months.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Warranty</h2>
              <p className="text-gray-600 mb-6">
                Devices are covered by a 12-month warranty against manufacturing defects. This warranty does not cover damage from misuse, unauthorized modifications, or external factors.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-6">
                Either party may terminate this agreement with 30 days written notice. Upon termination, your access to the platform will be revoked, and devices may be reclaimed if not fully paid for.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-600 mb-6">
                These terms shall be governed by the laws of the Republic of Ghana. Any disputes shall be resolved in the courts of Ghana.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-600 mb-6">
                For questions about these Terms of Service, please contact us at:<br />
                Email: legal@mechatronics.com.gh<br />
                Address: 123 Innovation Drive, East Legon, Accra, Ghana
              </p>
            </div>
          </div>
        </div>
      </section>

    </WebsiteLayout>
  );
}
