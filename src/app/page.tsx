import { redirect } from "next/navigation";
import { isSetupDone } from "@/lib/auth";

export default async function Home() {
  const setupDone = await isSetupDone();

  if (!setupDone) {
    redirect("/setup");
  } else {
    redirect("/menu");
  }
}
