import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface CandidateResult {
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

interface Props {
  electionTitle: string;
  totalVotes: number;
  candidates: CandidateResult[];
}

function exportCSV({ electionTitle, totalVotes, candidates }: Props) {
  const rows = [
    ['Election', electionTitle],
    ['Total Votes', String(totalVotes)],
    [],
    ['Rank', 'Candidate', 'Party', 'Votes', 'Percentage'],
    ...candidates
      .sort((a, b) => b.votes - a.votes)
      .map((c, i) => [String(i + 1), c.name, c.party, String(c.votes), `${c.percentage}%`]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${electionTitle.replace(/\s+/g, '_')}_results.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported successfully');
}

function exportPDF({ electionTitle, totalVotes, candidates }: Props) {
  const doc = new jsPDF();
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);

  doc.setFontSize(20);
  doc.setTextColor(0, 180, 216);
  doc.text('Votelytics', 105, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Election Results Report', 105, 32, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Election: ${electionTitle}`, 20, 48);
  doc.text(`Total Votes: ${totalVotes.toLocaleString()}`, 20, 56);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 64);

  doc.setDrawColor(0, 180, 216);
  doc.line(20, 70, 190, 70);

  // Table header
  let y = 80;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(0, 150, 180);
  doc.rect(20, y - 5, 170, 8, 'F');
  doc.text('Rank', 25, y);
  doc.text('Candidate', 45, y);
  doc.text('Party', 100, y);
  doc.text('Votes', 140, y);
  doc.text('%', 170, y);

  y += 10;
  doc.setTextColor(40, 40, 40);
  sorted.forEach((c, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(240, 248, 255);
      doc.rect(20, y - 5, 170, 8, 'F');
    }
    doc.text(`#${i + 1}`, 25, y);
    doc.text(c.name, 45, y);
    doc.text(c.party, 100, y);
    doc.text(c.votes.toLocaleString(), 140, y);
    doc.text(`${c.percentage}%`, 170, y);
    y += 10;
  });

  // Winner highlight
  if (sorted.length > 0) {
    y += 5;
    doc.setFontSize(11);
    doc.setTextColor(0, 150, 100);
    doc.text(`Winner: ${sorted[0].name} (${sorted[0].party}) — ${sorted[0].percentage}%`, 20, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Blockchain-verified results • Votelytics Platform', 105, 285, { align: 'center' });

  doc.save(`${electionTitle.replace(/\s+/g, '_')}_results.pdf`);
  toast.success('PDF exported successfully');
}

export default function ExportResults(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportCSV(props)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPDF(props)}>
          <FileText className="mr-2 h-4 w-4" /> Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
