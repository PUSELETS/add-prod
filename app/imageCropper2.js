'use client'
import { useRef, useState } from 'react';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import setCanvasPreview from './setCanvasPreview';

const ASPECt_Ratio = 1;
const MIN_DIMENTION = 150;

export function ImageCropper({ src, addToFireBase, handleImage }) {

    const [imageSrc, setImagrSrc] = useState(src);
    const [crop, setCrop] = useState();
    const [error, setError] = useState('');
    const imgRef = useRef(null);
    const previewCanvaRef = useRef(null);

    const onImageLoad = (e)=>{
        const {width, height, naturalWidth, naturalHeight} = e.currentTarget;
        if (naturalWidth < MIN_DIMENTION || naturalHeight < MIN_DIMENTION){
            setError('image must be at least 150 x 150 pixels.');
            setImagrSrc('');
            return
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
                    <img ref={imgRef} src={imageSrc} alt='Upload' style={{ maxHeight:  '50vh'}} onLoad={onImageLoad} />
                </ReactCrop>
                <button className='text-white font-mono text-xs py-2 px-4 rounded-2xl mt-4 bg-sky-500 hover:bg-sky-600'
                onClick={()=>{
                    setCanvasPreview(
                        imgRef.current,
                        previewCanvaRef.current,
                        convertToPixelCrop(
                            crop,
                            imgRef.current.width,
                            imgRef.current.height
                        )
                    );
                    const dataURL = previewCanvaRef.current.toDataURL()
                    addToFireBase(dataURL);
                    handleImage(dataURL)
                    
                }}
                >
                    Crop Image
                </button>
            </div>
            {
                crop &&
                <canvas
                  ref={previewCanvaRef}
                  className='mt-4'
                  style={{
                    display: "none",
                    border: "1px solid black",
                    objectFit: "contain",
                    width: 100,
                    height: 100, 
                  }}
                />
            }
        </>
    )

}