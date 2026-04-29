<template>
  <LegalLayout
    label="Legal"
    title="Privacy Policy"
    lastUpdated="April 2025"
    :sections="sections"
    :contact="contact"
  />
</template>

<script setup>
import LegalLayout from './LegalLayout.vue'

const contact = {
  text: 'For questions or requests regarding your personal data, reach out to our support team.',
  email: 'support@campusbaze.com',
}

const sections = [
  {
    heading: 'Information We Collect',
    intro: 'CampusBaze collects information in order to operate the platform effectively. This includes:',
    subsections: [
      {
        title: 'Personal Information',
        text: 'Information provided during account registration:',
        bullets: ['Name', 'Email address', 'Phone number', 'Profile photo', 'Campus affiliation (where applicable)'],
      },
      {
        title: 'Transaction Information',
        text: 'When users interact on the platform:',
        bullets: ['Service requests or job postings', 'Payment details', 'Transaction history', 'Communication between users within the platform'],
      },
      {
        title: 'Device and Technical Information',
        text: 'To improve performance and security:',
        bullets: ['IP address', 'Device type and browser type', 'Operating system', 'Usage activity on the platform'],
      },
    ],
  },
  {
    heading: 'How We Use Your Information',
    intro: 'CampusBaze uses collected information to:',
    bullets: [
      'Operate and maintain the platform',
      'Facilitate transactions between users',
      'Process payments and commissions',
      'Improve platform functionality and user experience',
      'Detect and prevent fraud or misuse',
      'Communicate updates and service notifications',
    ],
  },
  {
    heading: 'Information Sharing',
    intro: 'CampusBaze does not sell user data to third parties. However, information may be shared under the following circumstances:',
    bullets: [
      'With trusted payment processors to complete transactions',
      'When required by law, regulation, or legal authorities',
      'To protect the rights, safety, and security of CampusBaze, its users, or the public',
    ],
    body: 'Any third parties who process user information are expected to maintain appropriate data protection standards.',
  },
  {
    heading: 'Data Protection',
    body: 'CampusBaze implements reasonable technical and security measures to protect user data from unauthorized access. However, no digital platform can guarantee absolute security. Users are encouraged to take precautions to protect their accounts and login credentials.',
  },
  {
    heading: 'User Rights',
    intro: 'Users may request to:',
    bullets: [
      'Update their personal information',
      'Access the data associated with their account',
      'Delete their account and associated data',
    ],
    body: 'Requests may be made through CampusBaze Support.',
  },
  {
    heading: 'Policy Updates',
    body: 'CampusBaze may update this Privacy Policy periodically to reflect platform improvements, regulatory changes, or operational updates. Users will be notified of major policy updates. Continued use of the platform after such updates constitutes acceptance of the revised policy.',
  },
]
</script>