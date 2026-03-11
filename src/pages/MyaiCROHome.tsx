import { HeroSection } from '@/components/myaicro/HeroSection';
import { ProblemSection } from '@/components/myaicro/ProblemSection';
import { CategorySection } from '@/components/myaicro/CategorySection';
import { CapabilitiesSection } from '@/components/myaicro/CapabilitiesSection';
import { HowItWorksSection } from '@/components/myaicro/HowItWorksSection';
import { StackBuilderCTA } from '@/components/myaicro/StackBuilderCTA';
import { TrustSection } from '@/components/myaicro/TrustSection';
import { VisionSection } from '@/components/myaicro/VisionSection';
import { FinalCTA } from '@/components/myaicro/FinalCTA';
import { MyaiCROHeader } from '@/components/myaicro/MyaiCROHeader';
import { MyaiCROFooter } from '@/components/myaicro/MyaiCROFooter';

const MyaiCROHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <MyaiCROHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <CategorySection />
        <CapabilitiesSection />
        <HowItWorksSection />
        <StackBuilderCTA />
        <TrustSection />
        <VisionSection />
        <FinalCTA />
      </main>
      <MyaiCROFooter />
    </div>
  );
};

export default MyaiCROHome;
