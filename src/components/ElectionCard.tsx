import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Election } from '@/types';
import { Calendar, Users, Vote, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  active: { label: 'Live', className: 'bg-success/10 text-success border-success/20' },
  upcoming: { label: 'Upcoming', className: 'bg-warning/10 text-warning border-warning/20' },
  ended: { label: 'Ended', className: 'bg-muted text-muted-foreground border-border' },
};

export default function ElectionCard({ election, index = 0 }: { election: Election; index?: number }) {
  const status = statusConfig[election.status];
  const turnout = election.totalVoters ? Math.round(((election.totalVotes || 0) / election.totalVoters) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/election/${election.id}`} className="group block">
        <div className="card-glow rounded-xl p-6 transition-all duration-300">
          <div className="mb-4 flex items-start justify-between">
            <Badge variant="outline" className={status.className}>
              {status.label === 'Live' && (
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              )}
              {status.label}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>

          <h3 className="mb-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {election.title}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{election.description}</p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(election.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {election.totalVoters?.toLocaleString()} eligible
            </span>
            {election.status !== 'upcoming' && (
              <span className="flex items-center gap-1">
                <Vote className="h-3 w-3" />
                {turnout}% turnout
              </span>
            )}
          </div>

          {election.status === 'active' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Voter turnout</span>
                <span className="text-primary font-medium">{turnout}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${turnout}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
