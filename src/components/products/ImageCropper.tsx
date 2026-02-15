import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/utils/image-utils';
import { Loader2 } from 'lucide-react';

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
            <div className="relative w-full h-[400px] bg-muted rounded-xl overflow-hidden border border-border">
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
                        cropAreaClassName: "rounded-xl ring-2 ring-primary/20",
                        containerClassName: "rounded-xl"
                    }}
                />
            </div>

            <div className="space-y-4 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground w-16">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground w-16">Rotation</span>
                        <Slider
                            value={[rotation]}
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={(value) => setRotation(value[0])}
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 rounded-xl"
                        disabled={isCropping}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="flex-1 rounded-xl shadow-lg shadow-primary/20"
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
