<template>
  <section
    class="py-16 sm:py-20"
    style="border-top: 1px solid var(--color-cb-divider)"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-2xl mb-12">
        <p class="section-label">Our Partner Universities</p>
        <h2 class="section-title">Trusted across Nigeria's top campuses</h2>
        <p class="section-sub">
          We work with Universities to build verified students communities. Our
          growing network ensures access to trusted connections, real
          opportunities, and a reliable environment to get things done.
        </p>
      </div>

      <!-- Marquee Track -->
      <div class="marquee-wrapper">
        <div class="marquee-track">
          <div
            v-for="uni in [...universities, ...universities]"
            :key="uni.id"
            class="uni-card"
          >
            <img
              :src="uni.logo"
              :alt="uni.name"
              class="uni-logo"
              loading="lazy"
            />
            <span class="uni-name">{{ uni.shortName }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import unibenLogo from "@/assets/img/logos/uniben.png";
import uiLogo from "@/assets/img/logos/ui.png";
import unilagLogo from "@/assets/img/logos/unilag.png";
import oauLogo from "@/assets/img/logos/oau.png";
import covenantLogo from "@/assets/img/logos/covenant.png";
import abuLogo from "@/assets/img/logos/abu.png";
import lasuLogo from "@/assets/img/logos/lasu.png";
import futaLogo from "@/assets/img/logos/futa.png";
import unnLogo from "@/assets/img/logos/unn.png";
import babcockLogo from "@/assets/img/logos/babcock.png";
import coouLogo from "@/assets/img/logos/coou.png";
import esutLogo from "@/assets/img/logos/esut.png";
import unizikLogo from "@/assets/img/logos/unizik.png";

const universities = [
  { id: 1, name: "University of Benin", shortName: "UNIBEN", logo: unibenLogo },
  { id: 2, name: "University of Ibadan", shortName: "UI", logo: uiLogo },
  { id: 3, name: "University of Lagos", shortName: "UNILAG", logo: unilagLogo },
  {
    id: 4,
    name: "Obafemi Awolowo University",
    shortName: "OAU",
    logo: oauLogo,
  },
  {
    id: 5,
    name: "Covenant University",
    shortName: "Covenant",
    logo: covenantLogo,
  },
  { id: 6, name: "Ahmadu Bello University", shortName: "ABU", logo: abuLogo },
  { id: 7, name: "Lagos State University", shortName: "LASU", logo: lasuLogo },
  {
    id: 8,
    name: "Federal University of Technology",
    shortName: "FUTA",
    logo: futaLogo,
  },
  {
    id: 9,
    name: "University of Nigeria Nsukka",
    shortName: "UNN",
    logo: unnLogo,
  },
  {
    id: 10,
    name: "Babcock University",
    shortName: "Babcock",
    logo: babcockLogo,
  },
  {
    id: 11,
    name: "Covenant University",
    shortName: "Covenant",
    logo: covenantLogo,
  },

  {
    id: 13,
    name: "Enugu State University of Science and Technology",
    shortName: "ESUT",
    logo: esutLogo,
  },
  {
    id: 14,
    name: "Nnamdi Azikiwe University",
    shortName: "UNIZIK",
    logo: unizikLogo,
  },
  {
    id: 15,
    name: "Chukwuemeka Odumegwu Ojukwu University",
    shortName: "COOU",
    logo: coouLogo,
  },
];
</script>

<style scoped>
@reference "@/style.css";

.section-label {
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-cb-text);
  margin-bottom: 1rem;
}

.section-sub {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-cb-muted);
}

/* Marquee */
.marquee-wrapper {
  overflow: hidden;
  /* Fade edges */
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}

.marquee-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  animation: marquee 30s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

.uni-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 28px;
  border-radius: 12px;
  border: 1px solid var(--color-cb-divider);
  background-color: var(--color-cb-card);
  min-width: 140px;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
}

.uni-card:hover {
  border-color: var(--color-cb-accent);
}

.uni-logo {
  height: 52px;
  width: auto;
  max-width: 80px;
  object-fit: contain;
  /* Desaturate slightly so logos blend in both themes */
  filter: grayscale(20%);
  transition: filter 0.2s ease;
}

.uni-card:hover .uni-logo {
  filter: grayscale(0%);
}

.uni-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-cb-muted);
  white-space: nowrap;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
