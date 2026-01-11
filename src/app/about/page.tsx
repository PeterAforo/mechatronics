"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WebsiteLayout, PageHeader } from "@/components/website";
import { 
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  Lightbulb,
  ArrowRight
} from "lucide-react";

const teamMembers = [
  {
    name: "Kwame Asante",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "15+ years in IoT and embedded systems"
  },
  {
    name: "Ama Mensah",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face",
    bio: "Expert in cloud infrastructure and data systems"
  },
  {
    name: "Kofi Owusu",
    role: "Head of Engineering",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Hardware design and manufacturing specialist"
  },
  {
    name: "Efua Darko",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
    bio: "Operations and customer success leader"
  }
];

const stats = [
  { value: "500+", label: "Devices Deployed" },
  { value: "200+", label: "Happy Customers" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" }
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push the boundaries of IoT technology to deliver cutting-edge solutions."
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Our customers' success is our success. We go above and beyond to ensure satisfaction."
  },
  {
    icon: Award,
    title: "Quality",
    description: "We never compromise on quality. Our devices are built to last and perform reliably."
  },
  {
    icon: Globe,
    title: "Local Impact",
    description: "We're committed to solving African problems with African solutions and talent."
  }
];

export default function AboutPage() {
  return (
    <WebsiteLayout>
      <PageHeader
        title="About Us"
        subtitle="We're on a mission to bring smart monitoring solutions to every home, business, and industry in Africa."
        breadcrumbs={[{ label: "About" }]}
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=600&fit=crop"
      />

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Mechatronics was founded in 2020 with a simple observation: too many Ghanaian homes and businesses were losing money and resources due to lack of monitoring. Water tanks would run dry unexpectedly, electricity bills would skyrocket without explanation, and coldrooms would fail silently, spoiling valuable goods.
                </p>
                <p>
                  Our founders, a team of engineers and entrepreneurs, set out to change this. We developed affordable, reliable IoT devices specifically designed for African conditions – devices that work with our power infrastructure, our network coverage, and our climate.
                </p>
                <p>
                  Today, we serve hundreds of customers across Ghana, from individual homeowners to large industrial facilities. Our devices have helped save millions of cedis in prevented losses and reduced utility bills.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Mechatronics Team"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-indigo-600 text-white p-6 rounded-xl shadow-xl">
                <p className="text-3xl font-bold">Since 2020</p>
                <p className="text-indigo-200">Serving Ghana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To empower African homes, businesses, and industries with affordable, reliable IoT monitoring solutions that save resources, reduce costs, and provide peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become Africa's leading IoT solutions provider, making smart monitoring technology accessible to everyone, from rural farms to urban high-rises.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <Card key={idx} className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 group text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                    <value.icon className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              The passionate people behind Mechatronics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, idx) => (
              <Card key={idx} className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-5 text-center">
                  <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                  <p className="text-indigo-600 font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#f74780] to-[#f74780]/80 rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
            <Users className="h-12 w-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Growing Family
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're a homeowner, business, or industry, we have the right monitoring solution for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#f74780] hover:bg-gray-100 rounded-lg px-8 py-6 text-lg font-semibold transition-all hover:scale-105">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-lg px-8 py-6 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
