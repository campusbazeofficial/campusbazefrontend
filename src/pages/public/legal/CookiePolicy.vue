<template>
  <LegalLayout
    label="Legal"
    title="Cookie Policy"
    lastUpdated="April 2025"
    :sections="sections"
    :contact="contact"
  />
</template>

<script setup>
import LegalLayout from './LegalLayout.vue'

const contact = {
  text: 'If you have questions about our use of cookies, please contact our support team.',
  email: 'support@campusbaze.com',
}

const sections = [
  {
    heading: 'What Are Cookies',
    body: 'Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently, remember your preferences, and provide information to the website owners. CampusBaze uses cookies to improve your experience and ensure the platform functions correctly.',
  },
  {
    heading: 'How We Use Cookies',
    intro: 'CampusBaze uses cookies for the following purposes:',
    bullets: [
      'To keep you signed in during your session',
      'To remember your preferences and settings',
      'To understand how users navigate and interact with the platform',
      'To detect and prevent fraudulent or suspicious activity',
      'To measure the performance and usage of platform features',
    ],
  },
  {
    heading: 'Types of Cookies We Use',
    subsections: [
      {
        title: 'Essential Cookies',
        text: 'These cookies are necessary for the platform to function. They enable core features such as authentication, security, and session management. The platform cannot function properly without them.',
      },
      {
        title: 'Functional Cookies',
        text: 'These cookies remember your preferences and settings such as your language or theme choice  so you do not have to reconfigure them on every visit.',
      },
      {
        title: 'Analytics Cookies',
        text: 'These cookies help us understand how users interact with CampusBaze. The data collected is aggregated and anonymous and is used solely to improve platform performance and user experience.',
      },
    ],
  },
  {
    heading: 'Third-Party Cookies',
    body: 'Some features of CampusBaze may be provided by third-party services, such as payment processors. These third parties may set their own cookies on your device. CampusBaze does not control the use of these cookies and recommends reviewing the privacy and cookie policies of relevant third-party services.',
  },
  {
    heading: 'Managing Cookies',
    body: 'You can manage or disable cookies through your browser settings at any time. Please note that disabling certain cookies may affect the functionality of CampusBaze. Essential cookies cannot be turned off as they are required for the platform to operate.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'CampusBaze may update this Cookie Policy from time to time to reflect changes in technology, regulation, or platform operations. Any significant updates will be communicated through the platform. Continued use of CampusBaze after such changes constitutes acceptance of the updated policy.',
  },
]
</script>