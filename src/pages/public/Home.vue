<template>
  <main>
    <HeroSection />
    <PartnerUniversities />
    <WhyCampusBaze />
    <WeFitYourNeeds />
    <div id="how-it-works">
      <HowItWorks />
    </div>
    <Testimonials />
    <div id="faq">
      <FaqSection />
    </div>

    <ScrollToTop />
  </main>
</template>

<script setup>
import HeroSection        from '@/components/publicSections/HeroSection.vue'
import PartnerUniversities from '@/components/publicSections/PartnerUniversities.vue'
import WhyCampusBaze      from '@/components/publicSections/WhyCampusBaze.vue'
import WeFitYourNeeds     from '@/components/publicSections/WeFitYourNeeds.vue'
import HowItWorks         from '@/components/publicSections/HowItWorks.vue'
import Testimonials       from '@/components/publicSections/Testimonials.vue'
import FaqSection         from '@/components/publicSections/FaqSection.vue'
import ScrollToTop         from '@/components/reusables/ScrollToTop.vue'


</script>