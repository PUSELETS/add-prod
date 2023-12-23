"use client"
import React from 'react';
import { useState, useRef } from 'react';
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

        onDragEnd: () => {
            const newCrop = crop;
            const imageBounds = imageRef.current.getBoundingClientRect();
            const containerBounds = imageContainerRef.current.getBoundingClientRect();

            if(imageBounds.left > containerBounds.left) {
                newCrop.x = 0;
            } else if (imageBounds.right < containerBounds.right){
                newCrop.x = -(imageBounds.width - containerBounds.width);
            }

            if(imageBounds.top > containerBounds.top) {
                newCrop.y = 0;
            }else if (imageBounds.bottom < containerBounds.bottom){
                newCrop.y = (imageBounds.height - containerBounds.height);
            }

            setCrop(newCrop);
        },

    }, {
        drag: {
            from: ()=>[crop.x, crop.y]
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
