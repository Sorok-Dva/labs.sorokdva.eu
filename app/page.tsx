import { ExperienceGallery } from "@/components/experience-gallery"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ExperienceGallery />
    </main>
  )
}
