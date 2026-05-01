import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Target, GraduationCap, Briefcase, HelpCircle, Mail, Send } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

const CONTACT_EMAIL = 'support@votelytics.app';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  message: z.string().trim().min(5, 'Message is too short').max(1000, 'Message too long'),
});

const faqs = [
  {
    q: 'How does blockchain voting work?',
    a: 'When you cast a vote, it is cryptographically signed and submitted as a transaction to a blockchain ledger. Each transaction is bundled into a block, hashed, and chained to the previous block. This creates a permanent, distributed record that no single party — not even Votelytics — can secretly modify.',
  },
  {
    q: 'Is my vote anonymous?',
    a: 'Yes. Your identity is verified once at authentication, but the vote itself is recorded against a one-way cryptographic identifier — never your name, email, or Voter ID. Admins and auditors can verify that a vote is valid and counted, but cannot link any specific ballot back to you.',
  },
  {
    q: 'How is the system tamper-proof?',
    a: 'Every vote is hashed and linked to the previous one. Changing a single past vote would require recomputing every block after it across all nodes simultaneously — which is computationally infeasible. Auditors can independently verify the entire chain of hashes at any time.',
  },
  {
    q: 'Can I vote more than once?',
    a: 'No. Database-level unique constraints and on-chain checks prevent any voter from submitting more than one ballot per election, even if they try from multiple devices or sessions.',
  },
  {
    q: 'What happens if I lose my device mid-vote?',
    a: 'Votes are only finalized after on-chain confirmation. If your session is interrupted before that, no vote is recorded and you can safely retry from another device once you sign back in.',
  },
  {
    q: 'Who can see the results?',
    a: 'Aggregate results become visible to all voters once an election ends. Auditors can additionally inspect blockchain hashes to independently verify integrity, but individual ballots remain anonymous.',
  },
];


export default function About() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(`Votelytics contact from ${result.data.name}`);
    const body = encodeURIComponent(`${result.data.message}\n\n— ${result.data.name} (${result.data.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      toast.success('Opening your email client...');
      setForm({ name: '', email: '', message: '' });
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-4xl px-4 py-16"
      >
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About <span className="text-gradient">Votelytics</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Securing the Future of Digital Voting
          </p>
        </div>

        {/* What is Votelytics */}
        <section
          className="card-glow rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-3">What is Votelytics?</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Votelytics is a secure, modern e-voting platform designed to ensure
                  transparency, integrity, and voter privacy in digital elections.
                </p>
                <p>
                  It uses blockchain technology and advanced cryptography to create a
                  tamper-proof system where every vote is securely recorded and cannot
                  be altered.
                </p>
                <p>
                  The platform provides a smooth, responsive user experience so users
                  can vote with confidence.
                </p>
                <p>
                  Behind the scenes, robust backend systems, strict security protocols,
                  controlled access, and full voter anonymity are maintained.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Developed It */}
        <section
          className="card-glow rounded-2xl p-6 md:p-8 mb-10 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Who Developed It?</h2>
              <ul className="space-y-2.5 mb-4">
                <li className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <span><span className="font-semibold text-foreground">Developer:</span> <span className="text-muted-foreground">Mrunmayee Harishchandra Sawant</span></span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                  <span><span className="font-semibold text-foreground">Institution:</span> <span className="text-muted-foreground">Parle Tilak Vidyalaya Association's Sathaye College</span></span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" />
                  <span><span className="font-semibold text-foreground">Position:</span> <span className="text-muted-foreground">Lead Developer</span></span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Driven by a passion for secure systems and continuous innovation,
                Mrunmayee focuses on building trustworthy digital platforms that uphold
                the integrity of fair elections. Her work blends cryptography,
                blockchain, and thoughtful UX to make democracy stronger in the digital age.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="card-glow rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">Voting FAQ</h2>
              <p className="text-sm text-muted-foreground mb-4">
                How blockchain voting works, and how Votelytics protects anonymity and integrity.
              </p>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          className="card-glow rounded-2xl p-6 md:p-8 mb-10 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">Contact Us</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Questions, feedback, or security reports? Reach out at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary hover:underline font-medium"
                >
                  {CONTACT_EMAIL}
                </a>{' '}
                or send a quick message below.
              </p>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      maxLength={100}
                      placeholder="Your name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      maxLength={255}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    maxLength={1000}
                    placeholder="How can we help?"
                    rows={4}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground text-right">
                    {form.message.length}/1000
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-background p-10 md:p-14 text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.2),transparent_60%)]" />
          <div className="relative">
            <div className="mx-auto mb-5 inline-flex rounded-2xl bg-primary/15 p-4 border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              To build a secure, transparent, and accessible digital voting ecosystem
              that empowers trust, protects privacy, and strengthens democracy through
              technology.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
