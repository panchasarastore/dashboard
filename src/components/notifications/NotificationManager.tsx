import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface DashboardNotification {
    id: string;
    type: 'order' | 'stock' | 'payment' | 'summary';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    metadata?: any;
}

const NotificationManager = () => {
    const { activeStore } = useStore();
    const navigate = useNavigate();
    const [history, setHistory] = useState<DashboardNotification[]>([]);
    const lastSoundTime = useRef(0);
    const audioUnlocked = useRef(false);

    // Initialize history from localStorage
    useEffect(() => {
        if (!activeStore?.id) return;
        const saved = localStorage.getItem(`dashboard_notifications_${activeStore.id}`);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        }
    }, [activeStore?.id]);

    // Persist history
    useEffect(() => {
        if (activeStore?.id) {
            localStorage.setItem(`dashboard_notifications_${activeStore.id}`, JSON.stringify(history.slice(0, 50)));
            // Dispatch custom event for Bell UI
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: history }));
        }
    }, [history, activeStore?.id]);

    // Sync state from manual actions in Bell UI
    useEffect(() => {
        const handleSync = (e: any) => {
            // Only update if it's a sync request from UI to avoid loops
            if (e.detail?._isSyncRequest) {
                setHistory(e.detail.notifications);
            }
        };
        window.addEventListener('notifications-sync-request', handleSync);
        return () => window.removeEventListener('notifications-sync-request', handleSync);
    }, []);

    // Unlock audio on first interaction
    useEffect(() => {
        const unlock = () => {
            audioUnlocked.current = true;
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
    }, []);

    const playSound = useCallback((type: 'order' | 'alert') => {
        const now = Date.now();
        if (now - lastSoundTime.current < 5000) return; // Throttle 5s

        if (!audioUnlocked.current) return;

        try {
            const url = type === 'order'
                ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' // Cha-ching preview
                : 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Alert preview
            const audio = new Audio(url);
            audio.volume = document.visibilityState === 'visible' ? 0.4 : 0.6;
            audio.play();
            lastSoundTime.current = now;
        } catch (e) {
            console.warn('Audio playback failed', e);
        }
    }, []);

    const addNotification = useCallback((notif: Omit<DashboardNotification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotif: DashboardNotification = {
            ...notif,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        setHistory(prev => [newNotif, ...prev].slice(0, 50));

        // Signalling
        if (document.visibilityState === 'visible') {
            toast.success(newNotif.title, {
                description: newNotif.message,
                action: {
                    label: 'View',
                    onClick: () => {
                        if (newNotif.type === 'order') navigate(`/dashboard/orders/${newNotif.metadata.orderId}`);
                        if (newNotif.type === 'stock') navigate(`/dashboard/edit-product/${newNotif.metadata.productId}`);
                    }
                },
                duration: 8000,
            });
        } else {
            if ('Notification' in window && Notification.permission === 'granted') {
                const n = new Notification(newNotif.title, {
                    body: newNotif.message,
                    icon: '/favicon.ico', // Fallback
                    tag: newNotif.metadata?.orderId || newNotif.metadata?.productId,
                });
                n.onclick = () => {
                    window.focus();
                    if (newNotif.type === 'order') navigate(`/dashboard/orders/${newNotif.metadata.orderId}`);
                    if (newNotif.type === 'stock') navigate(`/dashboard/edit-product/${newNotif.metadata.productId}`);
                };
            }
        }

        playSound(newNotif.type === 'order' ? 'order' : 'alert');
    }, [navigate, playSound]);

    // Real-time Subscriptions
    useEffect(() => {
        if (!activeStore?.id) return;

        const channel = supabase
            .channel(`dashboard-alerts-${activeStore.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `store_id=eq.${activeStore.id}`,
                },
                async (payload) => {
                    const order = payload.new as any;

                    // Intelligence Layer: Repeat Customer Check
                    const { count } = await supabase
                        .from('orders')
                        .select('*', { count: 'exact', head: true })
                        .eq('customer_email', order.customer_email)
                        .eq('store_id', activeStore.id);

                    const isRepeat = (count || 0) > 1;

                    let prefix = isRepeat ? '🎉' : '🆕';
                    let urgency = isRepeat ? ' [Repeat Customer]' : '';

                    if (order.total_amount > 2000) {
                        prefix = '🔥';
                        urgency += ' [High Value]';
                    }
                    if (order.customer_notes) {
                        prefix = '💬';
                        urgency += ' [Custom Note]';
                    }

                    addNotification({
                        type: 'order',
                        title: `${prefix} New Order #${order.order_number}${urgency}`,
                        message: `${order.customer_name} placed an order for ₹${order.total_amount}`,
                        metadata: { orderId: order.id }
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                    filter: `store_id=eq.${activeStore.id}`,
                },
                (payload) => {
                    const old = payload.old as any;
                    const current = payload.new as any;

                    // Edge-triggered Low Stock detection
                    if (
                        old.stock_quantity !== undefined &&
                        current.stock_quantity !== null &&
                        old.stock_quantity > (current.min_stock_level || 5) &&
                        current.stock_quantity <= (current.min_stock_level || 5)
                    ) {
                        addNotification({
                            type: 'stock',
                            title: `⚠️ Low Stock Alert`,
                            message: `"${current.name}" is down to ${current.stock_quantity} units.`,
                            metadata: { productId: current.id }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeStore?.id, addNotification]);

    // Daily Summary Logic
    useEffect(() => {
        if (!activeStore?.id) return;

        const checkSummary = async () => {
            const today = new Date().toISOString().split('T')[0];
            const lastShown = localStorage.getItem(`last_summary_shown_${activeStore.id}`);

            const now = new Date();
            if (now.getHours() >= 6 && lastShown !== today) {
                try {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    const { data: yesterdayOrders, error } = await supabase
                        .from('orders')
                        .select('total_amount')
                        .eq('store_id', activeStore.id)
                        .gte('created_at', `${yesterdayStr}T00:00:00Z`)
                        .lte('created_at', `${yesterdayStr}T23:59:59Z`);

                    if (error) throw error;

                    const typedOrders = yesterdayOrders as { total_amount: number }[] | null;
                    const totalSales = typedOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
                    const orderCount = typedOrders?.length || 0;

                    if (orderCount > 0 || lastShown === null) {
                        addNotification({
                            type: 'summary',
                            title: `📅 Daily Report: ${yesterdayStr}`,
                            message: `Yesterday you had ${orderCount} orders totaling ₹${totalSales.toLocaleString()}. Great work!`,
                            metadata: { date: yesterdayStr }
                        });
                        localStorage.setItem(`last_summary_shown_${activeStore.id}`, today);
                    }
                } catch (e) {
                    console.error('Failed to generate daily summary', e);
                }
            }
        };

        const timer = setTimeout(checkSummary, 2000);
        return () => clearTimeout(timer);
    }, [activeStore?.id, addNotification]);

    // Request Permissions
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return null;
};

export default NotificationManager;
