import Link from "next/link";
import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";
import ContactForm from "@/components/ContactForm";

export const dynamic = 'force-dynamic';

// SVG Icons
const Icons = {
  Clarity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.854 1.566-2.126 1.48-.44 2.966-1.077 4.542-1.928 1.483-.8 2.068-2.658 1.25-4.14a9.015 9.015 0 0 0-4.006-3.682 9 9 0 0 0-4.01-1.127 8.974 8.974 0 0 0-3.32.484 9.01 9.01 0 0 0-6.142 5.37C4.16 11.233 4.14 12.55 5.093 13.568c.55.587.809 1.365.809 2.15V18" />
    </svg>
  ),
  Compliance: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  ),
  Support: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.741-.479 3 3 0 0 0 4.682 2.72m.943-3.21c.229.026.46.044.695.044a5.95 5.95 0 0 0 2.684-.636m8.498-8.823a2.996 2.996 0 1 1 5.992 0 2.996 2.996 0 0 1-5.992 0Zm-13.49 0a2.996 2.996 0 1 1 5.992 0 2.996 2.996 0 0 1-5.992 0Z" />
    </svg>
  ),
  Transparency: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
};

const featureIcons = [Icons.Clarity, Icons.Compliance, Icons.Support, Icons.Transparency];

async function getContent() {
  await dbConnect();
  const content = await SiteContent.getContent();
  return JSON.parse(JSON.stringify(content));
}

export default async function Home() {
  const content = await getContent();
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-secondary">
              BioVibe<span className="text-primary">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {/* Navigation removed for single-flow design */}
          </div>
        
          {/* <Link href="/secure" className="px-6 py-2.5 bg-primary/10 text-primary font-medium rounded-full hover:bg-primary hover:text-white transition-all duration-300">
            Order Products
          </Link> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-10 lg:pt-48 lg:pb-20 px-6">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-teal-100/30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-40 left-[-200px] w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-secondary tracking-tight leading-[1.1]">
            {content.heroTitle} 
            <span className="text-primary block mt-2">{content.heroTitleHighlight}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <a href="#contact" className="px-8 py-4 bg-primary text-white rounded-full font-medium text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center">
              {content.heroCtaText}
            </a>
          </div>
        </div>

        {/* Hero Visual/Glass Card */}
        <div className="mt-20 max-w-6xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/50 shadow-2xl flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40 z-10" />
             {/* Abstract medical/science visual representation */}
             <div className="w-full h-full bg-[url('/img.jpeg')] bg-cover bg-center"></div>
             <div className="absolute z-20 bottom-10 left-10 text-left">
                <p className="text-sm font-bold tracking-wider text-primary uppercase mb-2">{content.heroImageCaption}</p>
                <h3 className="text-3xl font-serif font-bold text-secondary">{content.heroImageSubCaption}</h3>
             </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Features */}
      <section className="pt-12 pb-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-16">
            <h2 className="font-serif text-4xl font-bold text-secondary mb-4">{content.featuresSectionTitle}</h2>
            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features?.map((feature, i) => {
              const FeatureIcon = featureIcons[i] || featureIcons[0];
              return (
                <div key={i} className="group p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-secondary mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">{content.servicesSectionLabel}</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">{content.servicesSectionTitle}</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {content.services?.map((service, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 group cursor-pointer backdrop-blur-sm">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-2">
                    {service.tags?.map((tag, idx) => (
                      <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-primary">{tag}</span>
                    ))}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white/50 group-hover:text-primary transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-white pt-16 pb-4 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="font-serif text-4xl font-bold text-secondary mb-6">{content.contactTitle}</h2>
              <p className="text-gray-600 mb-8 max-w-md">{content.contactSubtitle}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span>{content.contactEmail}</span>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>{content.copyrightText}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
