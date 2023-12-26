"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';

export default function ImageCrop({ src }) {

    const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
    const imageRef = useRef();
    const imageContainerRef = useRef();

    useGesture({
        onDrag: ({ offset: [dx, dy] }) => {
            setCrop((crop) => ({ ...crop, x: dx, y: dy }));
        },
        onPinch: ({ offset: [d] }) => {
            setCrop((crop) => ({ ...crop, scale: 1 + d / 50 }));
        },

        onDragEnd: () => {
            const newCrop = crop;
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
                newCrop.y = (imageBounds.height - containerBounds.height) + heightOverhang;
            }

            setCrop(newCrop);
            setCrop(newCrop)
        },

    }, {
        drag: {
            from: () => [crop.x, crop.y]
        },
        pinch: {
            distanceBounds: { min: 0 },
        },
        target: imageRef,
        eventOptions: { passive: false },
    });



    return (
        <>
            <div ref={imageContainerRef} className='overflow-hidden aspect-[1]'>
                <img
                    src={src}
                    ref={imageRef}
                    style={{
                        left: crop.x,
                        top: crop.y,
                        transform: `scale(${crop.scale})`,
                        touchAction: "none",
                    }}
                    className='relative object-contain w-full h-full max-w-none max-h-none'
                />
            </div>
        </>
    )
}
