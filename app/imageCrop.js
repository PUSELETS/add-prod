"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';

export default function ImageCrop({ src }) {

    const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
    const imageRef = useRef();
    const imageContainerRef = useRef();

    useGesture({
        onDrag: ({ movement: [dx, dy] }) => {
            setCrop((crop) => ({ ...crop, x: dx, y: dy }));
        },
        onPinch: ({ offset: [d] }) => {
            setCrop((crop) => ({ ...crop, scale: 1 + d / 50 }));
        },

        

    }, {
        pinch: {
            distanceBounds: {min: 0},
        },
        target: imageRef,
        eventOptions: { passive: false },
    });
    


    return (
        <>
            <div className='overflow-hidden aspect-[1]'>
                <div ref={imageContainerRef}>
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
            </div>
        </>
    )
}
