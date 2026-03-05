import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Blocks, Vote, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Blocks, title: 'Blockchain Secured', desc: 'Every vote is recorded as an immutable transaction on the Ethereum blockchain.' },
  { icon: Lock, title: 'Tamper-Proof', desc: 'Smart contracts enforce voting rules — no double voting, no manipulation.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Auditors can verify every vote using blockchain transaction hashes.' },
  { icon: Shield, title: 'Anonymous Voting', desc: 'Your identity is protected while your vote remains verifiable.' },
];

const stats = [
  { value: '10K+', label: 'Votes Cast' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50+', label: 'Elections' },
  { value: '0', label: 'Tampering' },
];

export default function Landing() {
  return (
    <div className="min-h-screen grid-pattern">
      {/* Hero */}
      <section className="container relative overflow-hidden py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Blocks className="h-3.5 w-3.5" />
            Powered by Ethereum Blockchain
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Secure Voting
            <br />
            <span className="text-gradient glow-text">Redefined</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            A decentralized voting platform for universities and organizations.
            Transparent, immutable, and tamper-proof elections on the blockchain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground px-8" asChild>
              <Link to="/register">
                Start Voting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </motion.div>

        {/* Floating decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-neon/5 blur-3xl" />
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="py-8 text-center"
            >
              <div className="text-3xl font-bold text-gradient">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold">Why Votelytics?</h2>
          <p className="text-muted-foreground">Built on blockchain technology for maximum trust and security.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="card-glow rounded-xl p-6 transition-all duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
        </motion.div>
        <div className="mx-auto max-w-2xl space-y-4">
          {[
            'Register and verify your identity',
            'Connect your MetaMask wallet',
            'Browse active elections and candidates',
            'Cast your vote — recorded on the blockchain',
            'Receive a transaction hash as proof',
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/50 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <span className="text-sm">{step}</span>
              <CheckCircle className="ml-auto h-4 w-4 text-success shrink-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Votelytics © 2026</span>
          </div>
          <div className="flex gap-6">
            <span>Blockchain-Secured Elections</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
