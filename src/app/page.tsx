import prisma from "@/lib/prisma";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home() {
  // Fetch published products from database
  const products = await prisma.deviceProduct.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  // Convert BigInt to string for serialization
  const serializedProducts = products.map(p => ({
    id: p.id.toString(),
    name: p.name,
    productCode: p.productCode,
    category: p.category,
    shortDescription: p.shortDescription,
    description: p.description,
    currency: p.currency,
    setupFee: Number(p.setupFee),
    monthlyFee: Number(p.monthlyFee),
  }));

  return <LandingPage products={serializedProducts} />;
}
