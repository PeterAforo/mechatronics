import Navbar from "./Navbar";
import Footer from "./Footer";
import NewsletterSection from "./NewsletterSection";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
