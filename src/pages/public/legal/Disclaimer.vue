<template>
  <LegalLayout
    label="Legal"
    title="Disclaimer"
    lastUpdated="April 2025"
    :sections="sections"
    :contact="contact"
  />
</template>

<script setup>
import LegalLayout from './LegalLayout.vue'

const contact = {
  text: 'If you have questions about this Disclaimer, please contact our support team.',
  email: 'campusbazeofficial@gmail.com',
}

const sections = [
  {
    heading: 'Platform Role',
    body: 'CampusBaze is a technology platform that facilitates connections and transactions between users. Campus Baze does not directly provide, perform, or supervise any of the services listed or rendered on the platform. All services are provided directly by independent users  service providers  and Campus Baze is not a party to any service agreement entered into between users.',
  },
  {
    heading: 'No Guarantee of Service Quality',
    body: 'CampusBaze does not guarantee the accuracy, completeness, quality, safety, legality, or timeliness of any service listed or rendered on the platform. Users engage with other users entirely at their own risk and discretion. Campus Baze strongly encourages users to review profiles, ratings, and reviews before entering into service agreements.',
  },
  {
    heading: 'No Liability for User Actions',
    body: 'CampusBaze shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from the actions, conduct, or negligence of any user on the platform. This includes but is not limited to: failure to deliver a service, disputes between users, loss of funds resulting from transactions conducted outside the platform, or misrepresentation of services.',
  },
  {
    heading: 'External Links',
    body: 'CampusBaze may contain links to external websites or services for reference or convenience. These links are provided without endorsement and Campus Baze is not responsible for the content, accuracy, or practices of any external sites. Users should review the terms and privacy policies of any third-party services they access.',
  },
  {
    heading: 'Platform Availability',
    body: 'CampusBaze makes reasonable efforts to maintain consistent platform availability. However, the platform is provided on an "as is" and "as available" basis. Campus Baze does not warrant that the platform will be error-free, uninterrupted, or free from security vulnerabilities. Downtime may occur due to maintenance, technical issues, or events outside our control.',
  },
  {
    heading: 'Accuracy of Information',
    body: 'While Campus Baze strives to ensure that platform content and policies are accurate and current, we do not guarantee that all information on the platform is complete, correct, or up to date at all times. Users should not rely solely on platform information for important decisions and are encouraged to verify information independently.',
  },
  {
    heading: 'Changes to This Disclaimer',
    body: 'CampusBaze reserves the right to update or revise this Disclaimer at any time. Significant changes will be communicated through the platform. Continued use of Campus Baze following any updates constitutes acceptance of the revised Disclaimer.',
  },
]
</script>