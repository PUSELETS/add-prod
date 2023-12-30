"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animate, motion, useMotionValue } from 'framer-motion';

export default function ImageCrop({ src, crop, onCropChange }) {
    let x = useMotionValue(crop.x);
    let y = useMotionValue(crop.y);
    let scale = useMotionValue(crop.scale);
    let [isDragging, setIsDragging] = useState(false);
    let [isPinching, setIsPinching] = useState(false)

    const imageRef = useRef();
    const imageContainerRef = useRef();

    useGesture({
        onDrag: ({ dragging, offset: [dx, dy] }) => {
            setIsDragging(dragging);
            x.stop();
            y.stop();

            const imageBounds = imageRef.current.getBoundingClientRect();
            const containerBounds = imageContainerRef.current.getBoundingClientRect();
            const originalWidth = imageRef.current.clientWidth;
            const widthOverhang = (imageBounds.width - originalWidth) / 2;
            const originalHeight = imageRef.current.clientHeight;
            const heightOverhang = (imageBounds.width - originalHeight) / 2;

            let maxX = widthOverhang;
            let minX = -(imageBounds.width - containerBounds.width) + widthOverhang;
            let maxY = heightOverhang;
            let minY = -(imageBounds.height - containerBounds.height) + heightOverhang;


            x.set(dampen(dx, [minX, maxX]));
            y.set(dampen(dy, [minY, maxY]));
        },
        onPinch: ({
            pinching,
            memo,
            origin: [pinchOriginX, pinchOriginY],
            offset: [d], }) => {
            Event.preventDefault()
            setIsPinching(pinching)
            x.stop();
            y.stop();

            memo ??= {
                bounds: imageRef.current.getBoundingClientRect(),
                crop: {
                    x: x.get(), y: y.get(), scale: scale.get(),
                }
            };

            const transformOriginX = memo.bounds.x + memo.bounds.width / 2;
            const transformOriginY = memo.bounds.y + memo.bounds.height / 2;

            const displacementX = (transformOriginX - pinchOriginX) / memo.crop.scale;
            const displacementY = (transformOriginY - pinchOriginY) / memo.crop.scale;

            const initialOffsetDistance = (memo.crop.scale - 1) * 50;
            const movementDistance = d - initialOffsetDistance

            scale.set(1 + d / 50);
            x.set(memo.crop.x + (displacementX * movementDistance) / 50);
            y.set(memo.crop.y + (displacementY * movementDistance) / 50);

            return memo
        },

        onDragEnd: maybeaImage,
        onPinchEnd: maybeaImage,

    }, {
        drag: {
            from: () => [x.get(), y.get()],
        },
        pinch: {
            distanceBounds: { min: 0 },
        },
        target: imageRef,
        eventOptions: { passive: false },
    });

    function maybeaImage() {
        const newCrop = {
            x: x.get(), y: y.get(), scale: scale.get(),
        };
        const imageBounds = imageRef.current.getBoundingClientRect();
        const containerBounds = imageContainerRef.current.getBoundingClientRect();
        const originalWidth = imageRef.current.clientWidth;
        const widthOverhang = (imageBounds.width - originalWidth) / 2;
        const originalHeight = imageRef.current.clientHeight;
        const heightOverhang = (imageBounds.width - originalHeight) / 2;

        if (imageBounds.left > containerBounds.left) {
            newCrop.x = widthOverhang;
        } else if (imageBounds.right < containerBounds.right) {
            newCrop.x = -(imageBounds.width - containerBounds.width) + widthOverhang;
        }

        if (imageBounds.top > containerBounds.top) {
            newCrop.y = heightOverhang;
        } else if (imageBounds.bottom < containerBounds.bottom) {
            newCrop.y = -(imageBounds.height - containerBounds.height) + heightOverhang;
        }


        animate(x, newCrop.x, { type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] });
        animate(y, newCrop.y, { type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] });
        onCropChange(newCrop)
    }

    return (
        <>
            <div ref={imageContainerRef} className='relative overflow-hidden aspect-[1]'>
                <div className='relative overflow-hidden'>
                    <motion.img
                        src={src}
                        ref={imageRef}
                        style={{
                            x: x,
                            y: y,
                            scale: scale,
                            touchAction: "none",
                        }}
                        className='relative w-full h-full max-w-none max-h-none'
                    />
                    <div className={`pointer-events-none absolute inset-0 transition duration-300 ${isDragging || isPinching ? 'opacity-100' : 'opacity-0'}`}>
                        <div className='absolute inset-0 flex flex-col'>
                            <div className='self-strech flex-1 border-b border-gray-50'></div>
                            <div className='self-strech flex-1 border-b border-gray-50'></div>
                            <div className='self-strech flex-1'></div>
                        </div>
                        <div className='absolute inset-0 flex'>
                            <div className='self-strech flex-1 border-r border-gray-50'></div>
                            <div className='self-strech flex-1 border-r border-gray-50'></div>
                            <div className='self-strech flex-1'></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function dampen(val, [min, max]) {
    if (val > max) {
        let extra = val - max;
        let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
        return max + dampenedExtra * 2;
    } else if (val < min) {
        let extra = val - min;
        let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
        return max + dampenedExtra * 2;
    } else {
        return val
    }
}
