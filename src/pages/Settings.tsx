import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
    Settings as SettingsIcon,
    Truck,
    Store,
    CreditCard,
    Clock,
    Calendar as CalendarIcon,
    Save,
    CheckCircle2,
    AlertCircle,
    Plus,
    X,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Settings = () => {
    const { activeStore, refreshStore } = useStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        status: "draft",
        allows_delivery: true,
        allows_pickup: true,
        delivery_fee: 0,
        payment_methods: ["cod"],
        upi_id: "",
        store_address: "",
        operating_hours: {
            monday: [] as string[],
            tuesday: [] as string[],
            wednesday: [] as string[],
            thursday: [] as string[],
            friday: [] as string[],
            saturday: [] as string[],
            sunday: [] as string[]
        },
        blackout_dates: [] as string[]
    });

    useEffect(() => {
        if (activeStore) {
            setFormData({
                status: activeStore.status || "draft",
                allows_delivery: activeStore.allows_delivery ?? true,
                allows_pickup: activeStore.allows_pickup ?? true,
                delivery_fee: activeStore.delivery_fee || 0,
                payment_methods: activeStore.payment_methods || ["cod"],
                upi_id: activeStore.upi_id || "",
                store_address: (activeStore as any).store_address || "",
                operating_hours: (activeStore.operating_hours as any) || {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                },
                blackout_dates: activeStore.blackout_dates || []
            });
        }
    }, [activeStore]);

    const handleStatusToggle = async (checked: boolean) => {
        const newStatus = checked ? 'active' : 'draft';

        // Update local state first for immediate UI response
        setFormData(p => ({ ...p, status: newStatus }));

        if (!activeStore) return;

        try {
            const { error } = await supabase
                .from("stores")
                .update({ status: newStatus })
                .eq("id", activeStore.id);

            if (error) throw error;

            toast.success(`Store is now ${newStatus.toUpperCase()}`);
            await refreshStore();
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast.error(error.message || "Failed to update store status");
            // Revert local state on error
            setFormData(p => ({ ...p, status: activeStore.status }));
        }
    };

    const handleSave = async () => {
        if (!activeStore) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from("stores")
                .update({
                    status: formData.status as 'draft' | 'active' | 'suspended' | 'deleted',
                    allows_delivery: formData.allows_delivery,
                    allows_pickup: formData.allows_pickup,
                    delivery_fee: formData.delivery_fee,
                    payment_methods: formData.payment_methods,
                    upi_id: formData.upi_id,
                    store_address: formData.store_address,
                    operating_hours: formData.operating_hours,
                    blackout_dates: formData.blackout_dates
                })
                .eq("id", activeStore.id);

            if (error) throw error;

            toast.success("Settings updated successfully");
            await refreshStore();
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const togglePaymentMethod = (method: string) => {
        setFormData(prev => {
            const current = prev.payment_methods;
            if (current.includes(method)) {
                if (current.length === 1) return prev; // Keep at least one
                return { ...prev, payment_methods: current.filter(m => m !== method) };
            } else {
                return { ...prev, payment_methods: [...current, method] };
            }
        });
    };

    const addSlot = (day: string) => {
        const newSlot = "09:00 - 18:00";
        setFormData(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [day]: [...(prev.operating_hours as any)[day], newSlot]
            }
        }));
    };

    const removeSlot = (day: string, index: number) => {
        setFormData(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [day]: (prev.operating_hours as any)[day].filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const updateSlot = (day: string, index: number, value: string) => {
        setFormData(prev => {
            const newSlots = [...(prev.operating_hours as any)[day]];
            newSlots[index] = value;
            return {
                ...prev,
                operating_hours: {
                    ...prev.operating_hours,
                    [day]: newSlots
                }
            };
        });
    };

    const toggleDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        setFormData(prev => {
            const current = prev.blackout_dates;
            if (current.includes(dateStr)) {
                return { ...prev, blackout_dates: current.filter(d => d !== dateStr) };
            } else {
                return { ...prev, blackout_dates: [...current, dateStr].sort() };
            }
        });
    };

    if (!activeStore) return <div>Loading...</div>;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-primary" />
                        Store Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your store operations, delivery options, and payment methods.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold"
                >
                    {saving ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-5 h-5 mr-2" />}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap mb-6">
                    <TabsTrigger value="general" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
                    <TabsTrigger value="operations" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Shipping & Pickup</TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Payments</TabsTrigger>
                    <TabsTrigger value="availability" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Availability</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle>Global Status</CardTitle>
                            <CardDescription>Control your store visibility to customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors group">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold flex items-center gap-2">
                                        {formData.status === 'active' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                        Store is {formData.status.toUpperCase()}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.status === 'active'
                                            ? "Customers can browse and place orders from your store."
                                            : "Your store is currently in draft mode and not visible to the public."}
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.status === 'active'}
                                    onCheckedChange={handleStatusToggle}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary" />
                                    Delivery Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Enable Delivery</Label>
                                        <p className="text-sm text-muted-foreground">Allow customers to choose delivery.</p>
                                    </div>
                                    <Switch
                                        checked={formData.allows_delivery}
                                        onCheckedChange={(checked) => setFormData(p => ({ ...p, allows_delivery: checked }))}
                                    />
                                </div>
                                {formData.allows_delivery && (
                                    <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
                                        <Input
                                            id="delivery-fee"
                                            type="number"
                                            value={formData.delivery_fee}
                                            onChange={(e) => setFormData(p => ({ ...p, delivery_fee: Number(e.target.value) }))}
                                            className="rounded-xl h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">Flat fee per order for delivery.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="w-5 h-5 text-primary" />
                                    Pickup Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Enable Store Pickup</Label>
                                        <p className="text-sm text-muted-foreground">Allow customers to pick up from store.</p>
                                    </div>
                                    <Switch
                                        checked={formData.allows_pickup}
                                        onCheckedChange={(checked) => setFormData(p => ({ ...p, allows_pickup: checked }))}
                                    />
                                </div>
                                {formData.allows_pickup && (
                                    <div className="space-y-2 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="store-address">Pickup Address</Label>
                                        <Input
                                            id="store-address"
                                            placeholder="Enter your store's full address"
                                            value={formData.store_address}
                                            onChange={(e) => setFormData(p => ({ ...p, store_address: e.target.value }))}
                                            className="rounded-xl h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">This is where your customers will come to pick up their orders.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payments">
                    <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Accepted Payment Methods
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${formData.payment_methods.includes('cod') ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/50 bg-background hover:border-primary/30'}`}
                                    onClick={() => togglePaymentMethod('cod')}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">Cash on Delivery (COD)</span>
                                        <Switch checked={formData.payment_methods.includes('cod')} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Customers pay when they receive the order.</p>
                                </div>

                                <div
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${formData.payment_methods.includes('upi') ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/50 bg-background hover:border-primary/30'}`}
                                    onClick={() => togglePaymentMethod('upi')}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold">UPI Payment</span>
                                        <Switch checked={formData.payment_methods.includes('upi')} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Digital payment via GPay, PhonePe, etc.</p>
                                </div>
                            </div>

                            {formData.payment_methods.includes('upi') && (
                                <div className="space-y-2 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="upi-id">UPI ID / VPA</Label>
                                    <Input
                                        id="upi-id"
                                        placeholder="e.g. storename@okaxis"
                                        value={formData.upi_id}
                                        onChange={(e) => setFormData(p => ({ ...p, upi_id: e.target.value }))}
                                        className="rounded-xl h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">Enter your business UPI ID for direct bank transfers.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="availability">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Operating Hours
                                </CardTitle>
                                <CardDescription>Set your weekly recurring time slots.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {days.map(day => (
                                        <div key={day} className="space-y-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="capitalize font-bold text-sm tracking-tight">{day}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addSlot(day)}
                                                    className="h-8 text-[11px] font-black uppercase tracking-wider rounded-lg border-primary/20 text-primary hover:bg-primary/10"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Slot
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {(formData.operating_hours as any)[day]?.length === 0 ? (
                                                    <p className="text-[11px] text-muted-foreground italic px-2">Store closed on {day}</p>
                                                ) : (
                                                    (formData.operating_hours as any)[day].map((slot: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                                            <Input
                                                                value={slot}
                                                                onChange={(e) => updateSlot(day, idx, e.target.value)}
                                                                className="h-10 text-sm rounded-xl bg-background/50"
                                                                placeholder="e.g. 09:00 - 18:00"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeSlot(day, idx)}
                                                                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium bg-background/50 backdrop-blur-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    Blackout Dates
                                </CardTitle>
                                <CardDescription>Lock specific dates to prevent orders.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <Calendar
                                        mode="multiple"
                                        selected={formData.blackout_dates.map(d => new Date(d))}
                                        onSelect={(dates) => {
                                            if (dates) {
                                                const formatted = (dates as Date[]).map(d => format(d, "yyyy-MM-dd")).sort();
                                                setFormData(p => ({ ...p, blackout_dates: formatted }));
                                            }
                                        }}
                                        className="rounded-2xl border border-border/50 shadow-sm bg-background/30"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Locked Dates</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.blackout_dates.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No dates locked yet.</p>
                                        ) : (
                                            formData.blackout_dates.map(date => (
                                                <div key={date} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold animate-in zoom-in duration-200">
                                                    {format(new Date(date), "MMM dd, yyyy")}
                                                    <button aria-label="Remove blackout date" title="Remove blackout date" onClick={() => toggleDate(new Date(date))} className="hover:text-destructive transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
