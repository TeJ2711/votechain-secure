import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Props {
  electionId: string;
}

export default function ElectionFeedback({ electionId }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: existing } = useQuery({
    queryKey: ['election-feedback', electionId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('election_feedback')
        .select('*')
        .eq('election_id', electionId)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!electionId,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user || rating === 0) throw new Error('Please select a rating');
      const { error } = await supabase.from('election_feedback').insert({
        election_id: electionId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Feedback submitted!');
      qc.invalidateQueries({ queryKey: ['election-feedback', electionId] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to submit feedback'),
  });

  if (!user) return null;

  if (existing) {
    return (
      <div className="card-glow rounded-xl p-5 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Your Feedback</h3>
        </div>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`h-4 w-4 ${s <= (existing as any).rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
          ))}
        </div>
        {(existing as any).comment && (
          <p className="text-sm text-muted-foreground">{(existing as any).comment}</p>
        )}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Rate This Election</h3>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={`h-6 w-6 transition-colors ${
              s <= (hoverRating || rating) ? 'text-warning fill-warning' : 'text-muted-foreground'
            }`} />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Leave an anonymous comment (optional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="mb-3 resize-none"
        rows={2}
        maxLength={500}
      />
      <Button
        size="sm"
        onClick={() => submit.mutate()}
        disabled={rating === 0 || submit.isPending}
        className="bg-gradient-primary text-primary-foreground"
      >
        {submit.isPending ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </motion.div>
  );
}
