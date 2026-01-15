import mongoose from 'mongoose';

const FeatureSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
});

const ServiceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
});

const SiteContentSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    default: 'Supporting Providers with Guidance on',
  },
  heroTitleHighlight: {
    type: String,
    default: 'Peptide Solutions',
  },
  heroSubtitle: {
    type: String,
    default: 'Trusted, research-backed insights for optimizing patient wellness. We help healthcare professionals navigate the peptide landscape with precision and confidence.',
  },
  heroCtaText: {
    type: String,
    default: 'Start a Consultation',
  },
  heroCtaLink: {
    type: String,
    default: '/secure',
  },
  heroImageCaption: {
    type: String,
    default: 'Advanced Peptide Science',
  },
  heroImageSubCaption: {
    type: String,
    default: 'Enhancing Patient Outcomes',
  },

  // Features Section
  featuresSectionTitle: {
    type: String,
    default: 'Why Providers Partner With Us',
  },
  features: {
    type: [FeatureSchema],
    default: [
      { title: 'Clarity', description: 'Navigating the peptide landscape with precision.' },
      { title: 'Compliance', description: 'Guidance on regulatory standards.' },
      { title: 'Provider Support', description: 'Direct expertise for healthcare professionals.' },
      { title: 'Transparency', description: 'Honest information on peptide solutions.' },
    ],
  },

  // Services Section
  servicesSectionLabel: {
    type: String,
    default: 'Our Expertise',
  },
  servicesSectionTitle: {
    type: String,
    default: 'Areas of Consultation',
  },
  services: {
    type: [ServiceSchema],
    default: [
      { title: 'Peptide Blends', description: 'Custom combinations tailored for specific therapeutic goals.', tags: ['Custom', 'Specific'] },
      { title: 'Capsules & Formats', description: 'Alternative delivery systems beyond traditional injectables.', tags: ['Oral', 'Topical'] },
      { title: 'Advanced Compounds', description: 'Specialized solutions for complex patient needs.', tags: ['Research', 'Clinical'] },
    ],
  },

  // Footer/Contact Section
  contactTitle: {
    type: String,
    default: 'Ready to optimize your practice?',
  },
  contactSubtitle: {
    type: String,
    default: 'Connect with our team to learn how BioVibe Peptides can support your patient outcomes.',
  },
  contactEmail: {
    type: String,
    default: 'support@biovibepeptides.com',
  },

  // Copyright
  copyrightText: {
    type: String,
    default: '© 2024 BioVibe Peptides. All rights reserved.',
  },
  // Secure Order Page
  securePageTitle: {
    type: String,
    default: 'BioVibe Private Secure Order Form',
  },
  securePageDescription: {
    type: String,
    default: 'Please fill the correct quantities of items you need and submit your order. Once your form has been submitted, you will receive an email with a copy of the order and our team will reach out to collect payment.',
  },
  securePageContactText: {
    type: String,
    default: 'If you have any questions, contact us at',
  },
  securePageDisclaimer: {
    type: String,
    default: '⚠️ Disclaimer: Peptides are NOT FDA approved. It should be used under the guidance of a medical provider.',
  },
  securePageFeeText: {
    type: String,
    default: 'A standard 5% processing fee is added to each order to ensure secure processing and fulfillment.',
  },
}, {
  timestamps: true,
});

// Ensure only one document exists (singleton pattern)
SiteContentSchema.statics.getContent = async function() {
  let content = await this.findOne();
  if (!content) {
    content = await this.create({});
  }
  return content;
};

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
