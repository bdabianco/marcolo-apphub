import { HeroSection } from '@/components/myaicro/HeroSection';
import { ProblemSection } from '@/components/myaicro/ProblemSection';
import { CategorySection } from '@/components/myaicro/CategorySection';
import { CapabilitiesSection } from '@/components/myaicro/CapabilitiesSection';
import { HowItWorksSection } from '@/components/myaicro/HowItWorksSection';
import { StackBuilderCTA } from '@/components/myaicro/StackBuilderCTA';
import { TrustSection } from '@/components/myaicro/TrustSection';
import { VisionSection } from '@/components/myaicro/VisionSection';
import { FinalCTA } from '@/components/myaicro/FinalCTA';
import { MyaiCroHeader } from '@/components/myaicro/myaiCROHeader';
import { MyaiCroFooter } from '@/components/myaicro/myaiCROFooter';

const MyaiCroHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <MyaiCroHeader />
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
      <MyaiCroFooter />
    </div>
  );
};

export default MyaiCroHome;
