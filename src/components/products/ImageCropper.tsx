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
        <div className="flex flex-col gap-6">
            <div className="relative w-full h-[360px] bg-[#1a1a1a] rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl group/cropper">
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
                        cropAreaClassName: "rounded-xl ring-2 ring-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]",
                        containerClassName: "rounded-xl"
                    }}
                />
                <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-black/40 backdrop-blur-md text-white border-white/10 font-bold px-2 py-1 text-[9px] uppercase tracking-widest">
                        4:3 Target
                    </Badge>
                </div>
            </div>

            <div className="space-y-6 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Premium Zoom Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Zoom Level</span>
                            <span className="text-xs font-bold text-primary">{zoom.toFixed(1)}x</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Minus className="w-4 h-4 text-muted-foreground/30" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                                className="flex-1"
                            />
                            <Plus className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                    </div>

                    {/* Button-based Rotation Section */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block">Rotation</span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-2 hover:bg-muted font-bold transition-all"
                                onClick={() => handleRotate('left')}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase">Left</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-2 hover:bg-muted font-bold transition-all"
                                onClick={() => handleRotate('right')}
                            >
                                <RotateCw className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase">Right</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-muted/20">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl font-bold text-muted-foreground"
                        disabled={isCropping}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted"
                        disabled={isCropping}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        disabled={isCropping}
                    >
                        {isCropping ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Save Crop'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
