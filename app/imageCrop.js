"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animate, motion, useMotionValue } from 'framer-motion';

export default function ImageCrop({ src, crop, onCropChange }) {
    const x = useMotionValue(crop.x);
    const y = useMotionValue(crop.y);
    const scale = useMotionValue(crop.scale);

    const imageRef = useRef();
    const imageContainerRef = useRef();
    let animations = useRef([]);

    console.log(crop)

    useGesture({
        onDrag: ({ offset: [dx, dy] }) => {
            animations.current.forEach((a) => a.stop());

            x.set(dx);
            y.set(dy);
        },
        onPinch: ({
            memo,
            origin: [pinchOriginX, pinchOriginY],
            offset: [d], }) => {
            animations.current.forEach((a) => a.stop());

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

        animations.current = [
            animate(x, newCrop.x),
            animate(y, newCrop.y),
        ];
        onCropChange(newCrop)
    }

    return (
        <>
            <div ref={imageContainerRef} className='overflow-hidden aspect-[1]'>
                <div>
                    <motion.img
                        src={src}
                        ref={imageRef}
                        style={{
                            x: x,
                            y: y,
                            scale: scale,
                            touchAction: "none",
                        }}
                        className='relative w-auto h-full max-w-none max-h-none'
                    />
                </div>
            </div>
        </>
    )
}
