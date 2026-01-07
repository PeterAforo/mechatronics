import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on user type
  if (session.user.userType === "admin") {
    redirect("/admin");
  } else {
    redirect("/portal");
  }
}
