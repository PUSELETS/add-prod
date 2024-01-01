'use client'
import { useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ASPECt_Ratio = 1;
const MIN_DIMENTION = 150;

export function ImageCropper({ src }) {

    const [crop, setCrop] = useState();
    const [error, setError] = useState('')

    const onImageLoad = (e)=>{
        const {width, height, naturalWidth, naturalHeight} = e.currentTarget;
        if (naturalWidth < MIN_DIMENTION || naturalHeight < MIN_DIMENTION){
            setError('image must be at least 150 x 150 pixels.')
        }
        const cropWidthInPercent = (MIN_DIMENTION / width) * 100;
        const crop = makeAspectCrop(
            {
                unit: '%',
                width: cropWidthInPercent,
            },
            ASPECt_Ratio,
            width,
            height
        );
        const centeredCrop = centerCrop(crop, width, height);
        setCrop(centeredCrop);
    };

    return (
        <>
            {error && <p className='text-red-500 text-xs'>{error}</p>}
            <div className="flex flex-col items-center">
                <ReactCrop
                onChange={(pixelCrop, percentCrop)=>setCrop(percentCrop)}
                crop={crop}
                circularCrop
                keepSelection
                aspect={ASPECt_Ratio}
                minWidth={MIN_DIMENTION}
                >
                    <img src={src} alt='Upload' style={{ maxHeight:  '70vh'}} onLoad={onImageLoad} />
                </ReactCrop>
            </div>
        </>
    )

}