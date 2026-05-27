import { Hero } from '@/components/landing/Hero';
import {
  ProblemSection,
  HowItWorks,
  CredentialTypes,
  LiveStats,
  FeaturedBuilders,
  EmployerSection,
  CTABand,
} from '@/components/landing/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <CredentialTypes />
      <LiveStats />
      <FeaturedBuilders />
      <EmployerSection />
      <CTABand />
    </>
  );
}
