import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { data: notifications, unreadCount } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const navigate = useNavigate();

  const handleClick = (n: { id: string; read: boolean; election_id: string | null }) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.election_id) navigate(`/results/${n.election_id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {!notifications || notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/30 last:border-0',
                  !n.read && 'bg-primary/5'
                )}
              >
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <p className="text-sm font-medium truncate">{n.title}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
