<template>
  <LegalLayout
    label="Legal"
    title="Terms of Service"
    lastUpdated="April 2025"
    :sections="sections"
    :contact="contact"
  />
</template>

<script setup>
import LegalLayout from './LegalLayout.vue'

const contact = {
  text: 'For questions, support requests, or complaints regarding these Terms, please contact our support team.',
  email: 'support@campusbaze.com',
}

const sections = [
  {
    heading: 'About CampusBaze',
    intro: 'CampusBaze is a digital marketplace that enables users to:',
    bullets: [
      'Post errands or service requests',
      'Offer skills or services',
      'Connect with students and members of campus ecosystems',
      'Complete tasks and receive payment through the platform',
    ],
    body: 'CampusBaze operates strictly as a facilitator and transaction platform. CampusBaze does not directly provide or perform any services listed on the platform and is not a party to service agreements made between users.',
  },
  {
    heading: 'Eligibility',
    intro: 'To use CampusBaze, you must:',
    bullets: [
      'Be at least 16 years old',
      'Provide accurate and complete registration information',
      'Agree to comply with all CampusBaze policies, rules, and community guidelines',
    ],
    body: 'CampusBaze is primarily designed for campus ecosystems, but participation is not limited to students. Non-students may join to request or provide services within campus communities. CampusBaze reserves the right to approve, reject, suspend, or terminate accounts at its sole discretion.',
  },
  {
    heading: 'User Accounts',
    intro: 'When creating an account, you agree to:',
    bullets: [
      'Provide truthful and accurate information',
      'Maintain the confidentiality of your account credentials',
      'Accept full responsibility for all activities conducted through your account',
    ],
    body: 'Users are responsible for safeguarding their login details. CampusBaze will not be liable for losses resulting from unauthorized access to your account.',
  },
  {
    heading: 'Services and Transactions',
    intro: 'CampusBaze enables users to participate in service-based transactions including, but not limited to: running errands, freelance services, skill-based work, and campus-related assistance. When users agree to a service, they enter into a direct agreement with each other.',
    subsections: [
      {
        title: 'Service providers are responsible for:',
        bullets: ['Delivering the service as described', 'Completing tasks within the agreed timeframe'],
      },
      {
        title: 'Clients are responsible for:',
        bullets: ['Providing accurate job descriptions', 'Cooperating during the execution of the service'],
      },
    ],
    body: 'CampusBaze does not guarantee the performance, quality, or outcome of any service.',
  },
  {
    heading: 'Payments and Fund Holding',
    intro: 'All payments for services conducted through CampusBaze must be processed through the platform. Payments made outside the platform may constitute a violation of platform policies.',
    body: 'When a client pays for a service, funds may be temporarily held by CampusBaze and released to the service provider once the client confirms successful service completion. CampusBaze reserves the right to delay or withhold payment release under circumstances including: pending service confirmation, disputes between users, suspicious or fraudulent activity, or violations of platform policies.',
  },
  {
    heading: 'Disputes',
    body: 'If a client believes a service has not been delivered as agreed, they may initiate a dispute through CampusBaze support. CampusBaze may review the dispute based on evidence provided by both parties, communication records, and the original service agreement. CampusBaze reserves the right to delay payment release, issue partial or full refunds, or apply warnings to users who violate agreements. Decisions made by CampusBaze regarding dispute resolution are final within the platform.',
  },
  {
    heading: 'Prohibited Activities',
    intro: 'Users are strictly prohibited from using CampusBaze for:',
    bullets: [
      'Fraud or scams',
      'Illegal goods or services',
      'Harassment, abuse, or threats',
      'Posting misleading or false services',
      'Academic misconduct (including exam impersonation or cheating)',
      'Circumventing the platform\'s payment system',
    ],
    body: 'Users who attempt to bypass platform payment systems may face account suspension or permanent removal.',
  },
  {
    heading: 'User Conduct',
    body: 'Users must maintain respectful and professional conduct when interacting on the platform. CampusBaze has zero tolerance for discrimination, harassment, threats, or intimidation. Any behavior that threatens the safety, integrity, or trust of the CampusBaze community may result in immediate account suspension or termination.',
  },
  {
    heading: 'Content Ownership',
    body: 'Users retain ownership of all content they upload to CampusBaze, including service descriptions, images, and portfolios. By posting content on the platform, users grant CampusBaze a non-exclusive license to display, distribute, and promote such content within the platform for operational and promotional purposes.',
  },
  {
    heading: 'Platform Availability',
    body: 'CampusBaze strives to maintain continuous platform access. However, uninterrupted availability cannot be guaranteed. Temporary interruptions may occur due to maintenance, technical issues, or security updates. CampusBaze will not be liable for losses resulting from temporary downtime or service interruptions.',
  },
  {
    heading: 'Account Suspension or Termination',
    body: 'CampusBaze reserves the right to suspend, restrict, or terminate user accounts that violate these Terms of Service, engage in fraudulent activity, misuse the platform, or threaten the safety or trust of the community. Users may request account deletion at any time by contacting CampusBaze support.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'CampusBaze functions solely as a technology platform that facilitates connections and transactions between users. While CampusBaze may temporarily hold funds to support fair transactions, it does not guarantee the quality, safety, timeliness, accuracy, or legality of services provided by users. Users engage with the platform at their own risk and discretion.',
  },
  {
    heading: 'Changes to These Terms',
    body: 'CampusBaze reserves the right to modify or update these Terms of Service at any time. Users will be notified of significant updates through the platform or other official communication channels. Continued use of CampusBaze following such updates constitutes acceptance of the revised terms.',
  },
]
</script>