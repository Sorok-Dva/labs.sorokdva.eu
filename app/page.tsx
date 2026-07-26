import { ExperienceGallery } from "@/components/experience-gallery"
import { HeroSection } from "@/components/hero-section"
import { SiteHeader } from "@/components/site-header"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-hidden">
        <HeroSection />
        <ExperienceGallery />
      </main>
    </>
  )
}
