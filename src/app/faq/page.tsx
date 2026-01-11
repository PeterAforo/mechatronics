"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WebsiteLayout, PageHeader } from "@/components/website";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is Mechatronics?",
        a: "Mechatronics is a Ghanaian IoT company that provides smart monitoring solutions for water tanks, power consumption, and temperature control. Our devices help homes, businesses, and industries monitor their resources in real-time."
      },
      {
        q: "Where do you operate?",
        a: "We currently operate in Ghana, with plans to expand across West Africa. Our devices work anywhere with GSM network coverage."
      },
      {
        q: "How do I get started?",
        a: "Simply create a free account on our platform, browse our products, and place an order. Our team will contact you to schedule installation."
      }
    ]
  },
  {
    category: "Products & Devices",
    questions: [
      {
        q: "What types of monitoring devices do you offer?",
        a: "We offer three main product categories: HydroLink for water tank monitoring, Electra for power consumption tracking, and FrostLink for coldroom temperature monitoring."
      },
      {
        q: "How do the devices connect to the internet?",
        a: "Our devices use GSM/cellular connectivity, so they work independently of your WiFi. This ensures reliable connectivity even in areas with unstable internet."
      },
      {
        q: "Do I need technical knowledge to use the devices?",
        a: "No! Our devices are designed for ease of use. We handle all installation, and you simply monitor everything through our user-friendly dashboard or mobile app."
      }
    ]
  },
  {
    category: "Installation",
    questions: [
      {
        q: "Who installs the devices?",
        a: "Our trained technicians handle all installations. We ensure proper setup and calibration before handing over to you."
      },
      {
        q: "How long does installation take?",
        a: "Most installations take 1-2 hours depending on the device type and location. We'll schedule a convenient time for you."
      },
      {
        q: "Is there a setup fee?",
        a: "Yes, there's a one-time setup fee that covers the device, installation, and initial configuration. This is separate from the monthly subscription."
      }
    ]
  },
  {
    category: "Pricing & Billing",
    questions: [
      {
        q: "How does pricing work?",
        a: "We charge a one-time setup fee for the device and installation, plus a low monthly subscription for monitoring, alerts, and dashboard access."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and card payments through Paystack."
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes, you can cancel anytime. However, the setup fee is non-refundable. Contact our support team to process cancellations."
      }
    ]
  },
  {
    category: "Alerts & Monitoring",
    questions: [
      {
        q: "How do I receive alerts?",
        a: "You can receive alerts via SMS, email, and push notifications. Configure your preferences in the dashboard settings."
      },
      {
        q: "Can I set custom alert thresholds?",
        a: "Yes! You can set custom thresholds for each device. For example, get alerted when your water tank drops below 20% or when temperature exceeds a certain level."
      },
      {
        q: "Is monitoring available 24/7?",
        a: "Yes, our devices monitor continuously 24/7 and send data to our cloud platform. You can check your dashboard anytime."
      }
    ]
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact support?",
        a: "You can reach us via email at support@mechatronics.com.gh, call our hotline, or use the contact form on our website."
      },
      {
        q: "What if my device stops working?",
        a: "Contact our support team immediately. We offer remote diagnostics and, if needed, will send a technician to fix or replace the device."
      },
      {
        q: "Is there a warranty?",
        a: "Yes, all our devices come with a 12-month warranty covering manufacturing defects and hardware failures."
      }
    ]
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <WebsiteLayout>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our IoT monitoring solutions."
        breadcrumbs={[{ label: "FAQ" }]}
        backgroundImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=600&fit=crop"
      />

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((category, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
                </div>
                <div className="px-6">
                  {category.questions.map((faq, faqIdx) => (
                    <FAQItem key={faqIdx} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="bg-indigo-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Link href="/contact">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </WebsiteLayout>
  );
}
