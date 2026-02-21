import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  Truck,
  Check,
  Loader2,
  Printer,
  ExternalLink,
  CreditCard,
  Wallet,
  History,
  FileText,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import AIResponseTemplates from '@/components/dashboard/AIResponseTemplates';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useOrder(orderId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  if (isLoading && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium italic">Fetching order intelligence...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Order not found</h2>
        <p className="text-muted-foreground font-medium mb-8">{error instanceof Error ? error.message : 'The order you are looking for does not exist or has been archived.'}</p>
        <Button onClick={() => navigate('/dashboard/orders')} className="rounded-2xl h-12 px-8 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: 'New',
      icon: Clock,
      color: '#f59e0b',
      className: 'bg-amber-50 text-amber-700 border-amber-200/50',
      next: 'confirmed' as const
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      color: '#3b82f6',
      className: 'bg-blue-50 text-blue-700 border-blue-200/50',
      next: 'preparing' as const
    },
    preparing: {
      label: 'Preparing',
      icon: Package,
      color: '#8b5cf6',
      className: 'bg-violet-50 text-violet-700 border-violet-200/50',
      next: 'ready' as const
    },
    ready: {
      label: 'Ready',
      icon: Truck,
      color: '#10b981',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      next: 'completed' as const
    },
    completed: {
      label: 'Completed',
      icon: Check,
      color: '#64748b',
      className: 'bg-slate-50 text-slate-600 border-slate-200/50',
      next: null
    }
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleWhatsApp = () => {
    const phone = order.customer_phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${order.customer_name}, I'm checking in regarding your order ${order.order_number} from our store.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleUpdateStatusManual = async (nextStatus: keyof typeof statusConfig) => {
    if (!orderId) return;

    console.log(`[Status Update] 🚀 Order: ${orderId} | New Status: ${nextStatus}`);

    const queryKey = ['order', orderId];

    // 0. Cancel any outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey });

    // 1. Optimistic Update in Cache
    const previousOrder = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        status: nextStatus,
        order_status: nextStatus,
        updated_at: new Date().toISOString()
      };
    });

    setIsUpdating(true);
    try {
      console.log(`[Supabase] 📡 Patching orders table...`);
      const { data, error: updateError } = await (supabase
        .from('orders') as any)
        .update({
          order_status: nextStatus
        })
        .eq('id', orderId)
        .eq('store_id', order.store_id) // Explicitly include store_id for RLS
        .select();

      if (updateError) throw updateError;

      // 2. Check if update actually changed anything (RLS check)
      if (!data || data.length === 0) {
        throw new Error('Update failed: No permissions or order not found. This might be an RLS policy issue.');
      }

      console.log(`[Supabase] ✅ Successfully updated:`, data);
      toast.success(`Order moved to ${statusConfig[nextStatus].label}`);

      // 3. Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

    } catch (err) {
      console.error('[Status Update] ❌ ERROR:', err);
      // 4. Rollback on Error
      queryClient.setQueryData(queryKey, previousOrder);
      toast.error(err instanceof Error ? err.message : 'Database update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // The linear flow of statuses for this order
  const ORDER_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'completed'] as (keyof typeof statusConfig)[];

  const currentStatusIndex = ORDER_FLOW.indexOf(order.status as any);

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0 scroll-smooth">
      {/* Top Navigation & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 print:hidden animate-fade-in">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/orders')}
            className="group -ml-2 text-muted-foreground hover:text-primary transition-all rounded-xl h-10 px-4"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Orders</span>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Order <span className="text-primary font-mono">{order.order_number.slice(0, 8)}</span>
            </h1>
            <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2", status.className)}>
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary/40" />
            Placed on {format(new Date(order.order_date), 'MMMM dd, yyyy')} • {format(new Date(order.order_date), 'p')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="rounded-2xl h-14 px-6 font-bold border-2 hover:bg-muted transition-all active:scale-95"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Summary
          </Button>

          <div className="relative group/status shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden w-full lg:w-auto">
            <select
              disabled={isUpdating}
              value={order.status}
              title="Change Order Status"
              aria-label="Change Order Status"
              onChange={(e) => {
                const nextStatus = e.target.value as any;
                if (nextStatus !== order.status) {
                  handleUpdateStatusManual(nextStatus);
                }
              }}
              className={cn(
                "appearance-none h-14 pl-8 pr-14 font-black text-base md:text-lg transition-all cursor-pointer disabled:opacity-50 outline-none w-full md:w-[220px] scale-100 hover:scale-[1.02] active:scale-95",
                order.status === 'pending' ? "bg-amber-500 text-white" :
                  order.status === 'confirmed' ? "bg-blue-600 text-white" :
                    order.status === 'preparing' ? "bg-violet-600 text-white" :
                      order.status === 'ready' ? "bg-emerald-600 text-white" :
                        "bg-slate-600 text-white"
              )}
            >
              {ORDER_FLOW.map(s => (
                <option key={s} value={s} className="text-foreground bg-popover font-bold">
                  {statusConfig[s].label}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/80" />}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Timeline Header */}
      <div className="bg-card border rounded-[2.5rem] p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
          {/* Continuous Progress Line */}
          <div className="absolute left-[22px] md:left-0 md:right-0 top-12 md:top-[22px] h-[calc(100%-44px)] md:h-0.5 w-0.5 md:w-full bg-muted/40 z-0"></div>

          {ORDER_FLOW.map((s, idx) => {
            const cfg = statusConfig[s];
            const Icon = cfg.icon;
            const isCompleted = idx <= currentStatusIndex;
            const isActive = idx === currentStatusIndex;

            return (
              <div key={s} className="flex md:flex-col items-center gap-4 md:gap-3 relative z-10 flex-1 group">
                <div className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-700 border-4",
                  isCompleted ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-card border-muted",
                  isActive && "ring-8 ring-primary/10"
                )}>
                  <Icon className={cn("w-5 h-5", isCompleted ? "text-primary-foreground" : "text-muted-foreground/30")} />
                </div>
                <div className="text-left md:text-center">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isCompleted ? "text-foreground" : "text-muted-foreground/40"
                  )}>
                    {cfg.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 font-medium hidden md:block">
                    {isCompleted ? (idx === currentStatusIndex ? 'Active Now' : 'Completed') : 'Next Up'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">



        {/* Main Panel: Registry & Actions (Lg: 9 cols) */}
        <div className="lg:col-span-9 space-y-8 animate-slide-up [animation-delay:100ms]">

          {/* Main Items Card (Order Registry) */}
          <div className="bg-card border rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Package className="w-40 h-40" />
            </div>

            <div className="flex items-center justify-between mb-8 border-b pb-6">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Order Registry
              </h2>
              <span className="text-[10px] uppercase font-black tracking-widest bg-muted px-3 py-1 rounded-full text-muted-foreground">
                {order.order_items?.length || 0} Positions
              </span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-border/40">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-6 py-8 first:pt-0 last:pb-0 group">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-muted overflow-hidden flex-shrink-0 border shadow-inner group-hover:scale-105 transition-transform duration-700">
                    {item.product_image ? (
                      <img src={item.product_image} className="w-full h-full object-cover" alt={item.product_name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xl font-black text-foreground truncate group-hover:text-primary transition-colors duration-500">{item.product_name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/products`)}
                        className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Manage Stock
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground font-bold text-sm">
                      <span className="text-primary/70">Ordered: {item.quantity}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span>₹{item.product_price.toLocaleString()} / unit</span>
                    </div>

                    {item.custom_note && (
                      <div className="mt-4 flex items-start gap-2 text-[13px] text-primary/80 font-bold bg-primary/5 p-4 rounded-2xl border border-primary/10 italic">
                        <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>"{item.custom_note}"</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-2xl font-black text-foreground">₹{item.item_total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Stack */}
            <div className="mt-10 pt-8 border-t-2 border-dashed border-border/60">
              <div className="flex flex-col gap-3 ml-auto max-w-xs">
                <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{(order.subtotal || order.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                  <span>Fulfillment & Tax</span>
                  <span className="text-emerald-600 font-black">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-border/40">
                  <span className="text-xs uppercase font-black tracking-widest text-muted-foreground/40">Total Secured</span>
                  <span className="text-4xl font-black text-foreground tracking-tighter italic">₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Intelligence & Logistics Nested Section */}
            <div className="flex items-center justify-between mt-12 mb-8 border-b pb-6">
              <h2 className="text-lg font-black text-foreground flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                Fulfillment & Logistics
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center">
                    {order.delivery_method === 'delivery' ? <MapPin className="w-4 h-4 text-primary" /> : <Package className="w-4 h-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Method</p>
                    <p className="font-black text-foreground capitalize text-xs">{order.delivery_method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center">
                    {order.payment_method === 'ONLINE' ? <CreditCard className="w-4 h-4 text-primary" /> : <Wallet className="w-4 h-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Payment</p>
                    <p className="font-black text-foreground text-xs">{order.payment_method}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 italic font-medium text-amber-800 text-[11px] leading-relaxed border-l-4 border-l-amber-400 h-full">
                  <span className="text-[9px] uppercase font-black block mb-2 opacity-60 tracking-wider">Internal Note</span>
                  {order.customer_notes ? `"${order.customer_notes}"` : "No special instructions provided."}
                </div>
              </div>
            </div>

            {order.delivery_method === 'delivery' && (
              <div className="mt-8 pt-8 border-t border-dashed border-border/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <h3 className="text-sm font-black text-foreground flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    Drop-off Address
                  </h3>
                  <Button variant="outline" className="rounded-xl h-8 px-3 font-black text-[9px] uppercase tracking-widest gap-2 border-2" onClick={() => window.open(`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`, '_blank')}>
                    <ExternalLink className="w-3 h-3" />
                    Open Maps
                  </Button>
                </div>
                <p className="text-muted-foreground font-bold text-xs mb-4 leading-relaxed">{order.delivery_address}</p>
                {order.delivery_landmark && (
                  <p className="text-[10px] font-bold text-muted-foreground/60"><span className="text-primary/60 uppercase tracking-widest mr-2 text-[9px]">Landmark:</span>{order.delivery_landmark}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Center (Sticky on Mobile) */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-primary/5 relative overflow-hidden group sticky bottom-4 md:static z-40 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <MessageSquare className="w-32 h-32" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 md:w-6 h-6 text-primary fill-primary/10" />
                  Action Center
                  <div className="group/info relative inline-block">
                    <AlertCircle className="w-4 h-4 text-muted-foreground/40 cursor-help hover:text-primary transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover border rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50">
                      <p className="text-[10px] leading-relaxed font-bold text-foreground italic">
                        Use AI to generate smart replies based on the current order context.
                      </p>
                    </div>
                  </div>
                </h2>
                <p className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-widest">Connect with {order.customer_name}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 md:h-14 flex-1 md:flex-none px-6 md:px-10 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageSquare className="w-4 h-4 md:w-5 h-5 fill-current" />
                  {showTemplates ? 'Hide AI' : 'AI Smart Reply'}
                </Button>
              </div>
            </div>

            {showTemplates && (
              <div className="mt-6 pt-6 border-t border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <AIResponseTemplates
                  customerName={order.customer_name}
                  orderNumber={order.order_number}
                  status={order.status}
                  onClose={() => setShowTemplates(false)}
                  onSend={(msg: string) => {
                    const phone = order.customer_phone.replace(/\D/g, '');
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    setShowTemplates(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Customer Insight (Sidebar) */}
        <div className="lg:col-span-3 space-y-8 animate-slide-up print:hidden [animation-delay:200ms]">
          <div className="bg-card border rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>

            <h2 className="text-xl font-black text-foreground mb-8 border-b pb-4">
              Customer Data
            </h2>

            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-white flex items-center justify-center shadow-inner border-2 border-primary/10 relative">
                  <User className="w-12 h-12 text-primary" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{order.customer_name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <a href={`tel:${order.customer_phone}`} className="flex items-center gap-4 p-4 rounded-2xl border bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all text-sm font-bold group">
                  <div className="w-8 h-8 rounded-lg bg-card border flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  {order.customer_phone}
                </a>
                <a href={`mailto:${order.customer_email}`} className="flex items-center gap-4 p-4 rounded-2xl border bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all text-sm font-bold group overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-card border flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="truncate flex-1">{order.customer_email}</span>
                </a>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mb-2">Customer Profile</p>
                <div className="p-4 rounded-2xl border bg-muted/5 shadow-inner">
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                    No previous purchase history found. New customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
