import { redirect } from "next/navigation";

/** FAQ content lives under Settings → FAQ; keep this route for old links. */
export default function FAQPage() {
    redirect("/settings?tab=faq");
}
