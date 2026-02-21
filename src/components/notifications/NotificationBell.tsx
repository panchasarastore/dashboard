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
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Initial load from local state (Manager handles persistence)
        const handleUpdate = (e: any) => {
            const newNotifications = e.detail;
            const newUnread = newNotifications.filter((n: any) => !n.isRead).length;
            const currentUnread = notifications.filter(n => !n.isRead).length;

            if (newUnread > currentUnread) {
                setAnimate(true);
                setTimeout(() => setAnimate(false), 500);
            }
            setNotifications(newNotifications);
        };

        window.addEventListener('notifications-updated', handleUpdate);

        return () => window.removeEventListener('notifications-updated', handleUpdate);
    }, [notifications]);

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
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-11 w-11 rounded-full bg-background border border-border/50 shadow-sm hover:shadow-md hover:bg-primary/[0.03] hover:border-primary/20 active:scale-95 transition-all duration-300 group",
                        animate && "animate-bounce"
                    )}
                >
                    <div className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-105 transition-transform duration-500 blur-md opacity-0 group-hover:opacity-100" />
                    <Bell className={cn("h-5 w-5 transition-colors z-10", unreadCount > 0 ? "text-primary stroke-[2.5]" : "text-muted-foreground")} />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-0.5 -right-0.5 h-6 min-w-[24px] flex items-center justify-center bg-primary text-white text-[11px] font-black border-[3px] border-background p-0 px-1 rounded-full shadow-lg z-20">
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
