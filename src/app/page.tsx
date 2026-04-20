import { HeroSection } from "@/components/home/HeroSection";
import { CuratedEssentials } from "@/components/home/CuratedEssentials";
import { EditorialEdit } from "@/components/home/EditorialEdit";
import { BestSellers } from "@/components/home/BestSellers";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CuratedEssentials />
      <EditorialEdit />
      <BestSellers />
      <NewsletterSection />
    </>
  );
}
