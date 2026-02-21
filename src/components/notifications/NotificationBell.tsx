import React, { useState, useEffect } from 'react';
import { Bell, Package, ShoppingBag, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { DashboardNotification } from './NotificationManager';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Initial load from local state (Manager handles persistence)
        const handleUpdate = (e: any) => {
            setNotifications(e.detail);
        };

        window.addEventListener('notifications-updated', handleUpdate);

        return () => window.removeEventListener('notifications-updated', handleUpdate);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
        window.dispatchEvent(new CustomEvent('notifications-sync-request', {
            detail: { notifications: updated, _isSyncRequest: true }
        }));
    };

    const clearHistory = () => {
        setNotifications([]);
        window.dispatchEvent(new CustomEvent('notifications-sync-request', {
            detail: { notifications: [], _isSyncRequest: true }
        }));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-4 h-4 text-primary" />;
            case 'stock': return <Package className="w-4 h-4 text-amber-500" />;
            case 'summary': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-primary/5 active:scale-95 transition-all">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-primary text-white text-[10px] font-black border-2 border-background p-0 px-1 rounded-full animate-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] rounded-3xl p-2 shadow-2xl border-border/50 backdrop-blur-xl bg-card/95">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">Notifications</h3>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:bg-primary/5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            Mark Read
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 text-[10px] font-bold uppercase tracking-tighter hover:text-destructive hover:bg-destructive/5 rounded-lg">
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Clear
                        </Button>
                    </div>
                </div>
                <DropdownMenuSeparator className="mx-2 opacity-50" />

                <div className="max-h-[70vh] overflow-y-auto py-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center opacity-40">
                            <Bell className="w-12 h-12 mb-3 stroke-[1.5]" />
                            <p className="text-xs font-bold uppercase tracking-widest italic">All caught up</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => {
                                    if (n.type === 'order') navigate(`/dashboard/orders/${n.metadata.orderId}`);
                                    if (n.type === 'stock') navigate(`/dashboard/products?id=${n.metadata.productId}`);
                                }}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 cursor-pointer rounded-2xl transition-all mb-1",
                                    !n.isRead ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-muted/50 opacity-70"
                                )}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={cn(
                                        "p-2 rounded-xl border shrink-0",
                                        !n.isRead ? "bg-white shadow-sm border-primary/10" : "bg-muted border-transparent"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-black truncate", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                                            {n.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed font-medium">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full flex justify-end">
                                    <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/50 italic mt-1">
                                        {formatDistanceToNow(new Date(n.timestamp))} ago
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
