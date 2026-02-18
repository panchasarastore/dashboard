import React from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Template {
    id: string;
    label: string;
    message: string;
    category: 'confirmation' | 'logistics' | 'delay';
}

interface AIResponseTemplatesProps {
    customerName: string;
    orderNumber: string;
    status: string;
    onSend: (message: string) => void;
    onClose: () => void;
}

const AIResponseTemplates: React.FC<AIResponseTemplatesProps> = ({
    customerName,
    orderNumber,
    status,
    onSend,
    onClose
}) => {
    const shortOrder = orderNumber.slice(0, 8);

    const templates: Template[] = [
        {
            id: 'confirm',
            label: 'Confirm Order',
            category: 'confirmation',
            message: `Hi ${customerName}! Alen's Crochet Stores here. We've received your order #${shortOrder} and we're starting work on it right away. Thank you for shopping with us!`
        },
        {
            id: 'preparing',
            label: 'Production Update',
            category: 'logistics',
            message: `Hi ${customerName}, just a quick update! Your order #${shortOrder} is currently being prepared. We'll let you know as soon as it's ready for delivery.`
        },
        {
            id: 'ready',
            label: 'Ready for Pickup',
            category: 'logistics',
            message: `Great news ${customerName}! Your order #${shortOrder} is now ready for pickup. Feel free to come by whenever you're ready.`
        },
        {
            id: 'completed',
            label: 'Checking Delivery',
            category: 'logistics',
            message: `Hi ${customerName}, your order #${shortOrder} should have reached you by now. Hope you love your new crochet items! Please let us know if everything is perfect.`
        },
        {
            id: 'delay',
            label: 'Small Delay',
            category: 'delay',
            message: `Hi ${customerName}, we're experiencing a slight delay with order #${shortOrder} due to high demand. We're working hard to get it to you as soon as possible. Apologies for the wait!`
        }
    ];

    const filteredTemplates = templates.filter(t => {
        if (status === 'pending' && t.category === 'confirmation') return true;
        if (status === 'preparing' && t.id === 'preparing') return true;
        if (status === 'ready' && t.id === 'ready') return true;
        if (status === 'completed' && t.id === 'completed') return true;
        if (t.category === 'delay') return true;
        return false;
    }).concat(templates.filter(t => !['confirmation', 'delay'].includes(t.category) && t.id !== status));

    // Deduplicate and prioritize current status
    const displayTemplates = Array.from(new Set(filteredTemplates)).slice(0, 4);

    return (
        <div className="bg-card border-2 border-primary/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">AI Smart Replies</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-4">
                {displayTemplates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSend(template.message)}
                        className="w-full text-left p-4 rounded-2xl border bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border",
                                template.category === 'confirmation' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                    template.category === 'delay' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                        "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                                {template.label}
                            </span>
                            <Send className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed italic">
                            "{template.message}"
                        </p>
                    </button>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-dashed">
                <p className="text-[10px] text-muted-foreground text-center font-medium">
                    Tapping a template will open WhatsApp with the message ready to send.
                </p>
            </div>
        </div>
    );
};

export default AIResponseTemplates;
