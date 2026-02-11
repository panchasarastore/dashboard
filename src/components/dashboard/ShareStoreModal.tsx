import { Copy, Instagram, MessageCircle, Share2, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeUrl: string;
}

const ShareStoreModal = ({ isOpen, onClose, storeUrl }: ShareStoreModalProps) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(storeUrl);
        toast.success('Store link copied to clipboard!');
    };

    const handleWhatsAppShare = () => {
        const message = encodeURIComponent(`Check out my store! 🛍️\n\n${storeUrl}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden border-none p-0">
                <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-serif font-bold">Share Your Store</DialogTitle>
                        <DialogDescription className="text-base">
                            Get your products in front of more customers with these sharing options.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Main Link Box */}
                    <div className="space-y-3 mb-8">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Your Live Store Link
                        </label>
                        <div className="flex items-center gap-2 p-1 pl-4 border-2 border-primary/20 bg-background rounded-xl focus-within:border-primary transition-all shadow-sm">
                            <div className="flex-1 font-mono text-sm truncate py-2">
                                {storeUrl}
                            </div>
                            <Button
                                type="button"
                                size="default"
                                className="rounded-lg px-4 gap-2 shadow-md hover:shadow-lg transition-all"
                                onClick={handleCopy}
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy Link</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Instagram Tip */}
                        <div className="group relative p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-3">
                                <Instagram className="w-5 h-5 text-pink-500" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Instagram Bio</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Most powerful way to grow! Add this link to your Instagram bio so followers can shop 24/7.
                            </p>
                            <div className="mt-3 flex items-center text-[10px] font-bold uppercase text-primary tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                Highly Recommended ⭐
                            </div>
                        </div>

                        {/* WhatsApp Section */}
                        <div className="p-4 rounded-2xl border border-border bg-card hover:border-success/50 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                                <MessageCircle className="w-5 h-5 text-success" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">WhatsApp Blast</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                Share directly with your contacts or in groups to announce new arrivals.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 border-success/30 text-success hover:bg-success/10 hover:border-success"
                                onClick={handleWhatsAppShare}
                            >
                                <ExternalLink className="h-3 w-3" />
                                <span>Share on WhatsApp</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex items-center gap-3 text-muted-foreground italic">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <Info className="w-4 h-4" />
                        </div>
                        <p className="text-xs">
                            Pro tip: Personalized messages often get 3x more clicks than just sending the link alone!
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareStoreModal;
