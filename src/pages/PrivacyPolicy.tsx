import {ArrowLeft} from 'lucide-react';

export default function PrivacyPolicy({onBack}:{onBack:()=>void}){
 return <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-7 sm:px-8 sm:py-10">
  <button onClick={onBack} className="mb-8 flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[.06] hover:text-white"><ArrowLeft size={18}/>Back</button>
  <article className="space-y-7 text-sm leading-6 text-zinc-300">
   <header className="space-y-2 border-b border-white/10 pb-5">
    <h1 className="text-3xl font-black text-white sm:text-4xl">Kippix – Privacy Policy</h1>
    <p className="text-zinc-500">Last updated: November 5, 2026</p>
   </header>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">1. About Kippix</h2>
    <p>Kippix is a free browser-based party game.</p>
    <p><strong className="text-white">Website:</strong> {window.location.origin}</p>
    <p><strong className="text-white">Data Controller:</strong> <span className="text-amber-200">Janne Raappana, Jere Leppiniemi and Matias Nisula</span></p>
    <p><strong className="text-white">Contact:</strong> <span className="text-amber-200">kippix.game@gmail.com</span></p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">2. Information We Process</h2>
    <p>Kippix does not require users to create an account. Player names and game progress are processed temporarily in the user's browser. They are not sent to a Kippix database or stored on Kippix application servers.</p>
    <p>The website hosting provider may process technical information, such as IP addresses and website request information, to deliver and secure the website.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">3. Why We Process Information</h2>
    <p>Player names and game information are used to provide the game's functionality.</p>
    <p>Technical information may be processed to deliver the website, maintain its security and prevent misuse. Where applicable, this processing is based on legitimate interests in maintaining a functional and secure service.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">4. Cookies and Local Storage</h2>
    <p>Kippix does not use advertising cookies, analytics trackers or browser local storage for gameplay. Player names and game progress are held temporarily in browser memory and are not saved for future visits.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">5. Third-Party Services</h2>
    <p>Kippix uses its website hosting provider to host and deliver the website. The provider may process technical information necessary for hosting and security.</p>
    <p>If hosted by Vercel, see <a className="text-fuchsia-300 underline underline-offset-4 hover:text-fuchsia-200" href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Vercel's Privacy Notice</a>.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">6. Data Retention and International Transfers</h2>
    <p>Player names and game progress are held temporarily in browser memory and are cleared when the page is closed or reloaded.</p>
    <p>Technical information processed by the hosting provider is retained according to the provider's applicable configuration and retention criteria. Hosting-related personal data may be processed outside the European Economic Area. Where required, international transfers are subject to appropriate safeguards under applicable data protection law.</p>
    <p>Further information about hosting-related data processing can be requested using the contact details above.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">7. Your Privacy Rights</h2>
    <p>Under applicable data protection law, you may have the right to access, correct or request deletion of your personal data, restrict or object to certain processing, and exercise other applicable privacy rights.</p>
    <p>For privacy-related questions or requests, contact us using the email address above. You also have the right to lodge a complaint with a competent data protection authority, including the Finnish Data Protection Ombudsman.</p>
   </section>
   <section className="space-y-2"><h2 className="text-xl font-bold text-white">8. Changes to This Policy</h2>
    <p>We may update this Privacy Policy when Kippix's features or data processing practices change. Updates will be published on this page together with a revised “Last updated” date.</p>
   </section>
  </article>
  <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-zinc-500">© {new Date().getFullYear()} Kippix. All rights reserved.</footer>
 </main>;
}
