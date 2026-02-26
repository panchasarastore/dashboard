import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/utils/image-utils';
import { Loader2, RotateCcw, RotateCw, Plus, Minus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspect?: number;
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 4 / 3 }: ImageCropperProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const handleRotate = (dir: 'left' | 'right') => {
        setRotation(prev => (prev + (dir === 'left' ? -90 : 90)) % 360);
    };

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
    };

    const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;

        setIsCropping(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[400px]">
            {/* Left Side: Cropper Work Area */}
            <div className="flex-1 min-w-0">
                <div className="relative w-full aspect-[4/3] bg-[#0a0a0a] rounded-2xl overflow-hidden border-2 border-white/5 shadow-inner group/cropper">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                        onCropComplete={onCropAreaComplete}
                        classes={{
                            cropAreaClassName: "rounded-lg ring-2 ring-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]",
                            containerClassName: "rounded-2xl"
                        }}
                    />
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 font-bold px-2 py-1 text-[9px] uppercase tracking-widest">
                            {aspect === 4 / 3 ? '4:3 Target' : 'Image Crop'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Right Side: Tool Sidebar */}
            <div className="w-full lg:w-[280px] flex flex-col justify-between py-2 overflow-y-auto">
                <div className="space-y-8">
                    {/* Premium Zoom Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Precision Zoom</span>
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{zoom.toFixed(1)}x</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Minus className="w-3.5 h-3.5 text-muted-foreground/30" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                                className="flex-1"
                            />
                            <Plus className="w-3.5 h-3.5 text-muted-foreground/30" />
                        </div>
                    </div>

                    {/* Button-based Rotation Section */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 block">Orientation</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl border-2 hover:bg-muted font-bold transition-all group/btn"
                                onClick={() => handleRotate('left')}
                            >
                                <RotateCcw className="w-4 h-4 mr-2 group-hover/btn:-rotate-45 transition-transform" />
                                <span className="text-[10px] uppercase">Rotate L</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl border-2 hover:bg-muted font-bold transition-all group/btn"
                                onClick={() => handleRotate('right')}
                            >
                                <RotateCw className="w-4 h-4 mr-2 group-hover/btn:rotate-45 transition-transform" />
                                <span className="text-[10px] uppercase">Rotate R</span>
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                            className="w-full h-9 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 text-[10px] uppercase tracking-wider"
                            disabled={isCropping}
                        >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Reset Settings
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-8 mt-8 border-t border-muted/20">
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        disabled={isCropping}
                    >
                        {isCropping ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Save Fine-Tune'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="w-full h-10 rounded-xl font-bold text-muted-foreground/60 hover:text-muted-foreground text-[10px] uppercase tracking-widest"
                        disabled={isCropping}
                    >
                        Discard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
