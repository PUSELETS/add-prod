"use client";
import 'react-image-crop/dist/ReactCrop.css';
import InputComponent from "./components/FormElements/InputComponent";
import * as Dialog from '@radix-ui/react-dialog';
import SelectComponent from "./components/FormElements/SelectComponent";
import { v4 } from 'uuid';
import { addNewProduct } from "./services/product";
import {
  adminAddProductformControls, firebaseConfig,
  firebaseStroageURL
} from "./utils";
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { ImageCropper } from './imageCropper2';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, firebaseStroageURL);

const initialFormData = {
  name: "",
  price: 0,
  description: "",
  imageUrl: [],
};


export default function AdminAddNewProduct() {
  const [formData, setFormData] = useState(initialFormData);
  const [imageA, setImageA] = useState([]);
  const [currentUpdatedProduct, setCurrentUpdatedProduct] = useState(null);
  const [componentLevelLoader, setComponentLevelLoader] = useState({
    loading: false,
    id: "",
  });
  const [base64Data, setBase64Data] = useState();
  const [resivedImg, setResivedImg] = useState();

  

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertBase64(file)
    setBase64Data(base64)
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, regect) => {

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        regect(error);
      }
    })
  }

  async function helperForUPloadingImageToFirebase(dataURL) {
    const storageReference = ref(storage, `theShop/${v4()}`);
    const grap = uploadString(storageReference, dataURL, 'data_url' ).then(data=>{
    const grap2 = getDownloadURL(data.ref).then(val=>{
        return val
      });
      alert('image uploaded')
      return grap2
    })
    return grap
  }

  const addToFireBase = (dataURL) => {
    setResivedImg(dataURL)
  }

  async function handleImage(dataURL) {
    const extractImageUrl = await helperForUPloadingImageToFirebase( dataURL );


    if (extractImageUrl !== "") {
      if (imageA.length > 5) {
        return;
      }
      else { setImageA([...imageA, extractImageUrl]) }
    }

  }

  useEffect(() => {
    if (currentUpdatedProduct !== null) setFormData(currentUpdatedProduct);
  }, [currentUpdatedProduct]);

  useEffect(() => {
    if (imageA.length > 0 && imageA.length <= 5) setFormData({
      ...formData,
      imageUrl: imageA
    })
  }, [imageA.length])


  async function handleAddProduct() {
    setComponentLevelLoader({ loading: true, id: "" });
    const res =
      currentUpdatedProduct !== null
        ? await updateAProduct(formData)
        : await addNewProduct(formData);


    if (res.success) {
      setComponentLevelLoader({ loading: false, id: "" });


      setFormData(initialFormData);

    } else {

      setFormData(initialFormData);
    }
  }

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger className="bg-yellow-300 m-4 p-4 shadow z-10  rounded-md">
          Add Picture
        </Dialog.Trigger>
        <Dialog.Portal className='z-10'>
          <Dialog.Overlay className='inset-0 bg-black/50 z-10' />
          <Dialog.Content className={`${base64Data ? 'p-0' : 'p-2'} fixed z-10 w-full max-w-md sm:max-w-xs top-1/2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/80 p-2 text-gray-900 shadow`}>
            <div className={`${base64Data ? 'm-2' : 'm-0'} flex justify-between items-center`}>
              <h2 className='text-xl'>Adding Product</h2>
              <Dialog.Close className='text-gray-400 hover:text-gray-500'>
                exit
              </Dialog.Close>
            </div>
            <div className="mt-8">

              {
                base64Data ?
                  (
                    <ImageCropper src={base64Data} addToFireBase={addToFireBase} handleImage={handleImage} />
                  ) :
                  (<div className="p-3 h-auto">
                    <div className="relative rounded-full aspect-[1]">
                      <button className="absolute inset-0 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-full aspect-[1]">
                        <div className="w-24 h-24 text-gray-200"></div>
                      </button>
                    </div>
                  </div>)
              }
              <input
                accept="image/*"
                max="1000000"
                type="file"
                className="block w-full text-sm text-slate-500 file:rounded-full file:text-xs file:border-0 file:bg-yellow-300 file:text-sky-300 hover:file:bg-yellow-500"
                onChange={(e) => {
                  uploadImage(e);
                }}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="mx-2">
        <div className="w-full max-w-md sm:max-w-xs rounded-md bg-[#fca5a5] p-4 text-gray-900 shadow mt-8 space-y-6 ">
          {adminAddProductformControls.map((controlItem) =>
            controlItem.componentType === "input" ? (
              <InputComponent
                key={controlItem.label}
                type={controlItem.type}
                placeholder={controlItem.placeholder}
                label={controlItem.label}
                value={formData[controlItem.id]}
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    [controlItem.id]: event.target.value,
                  });
                }}
              />
            ) : controlItem.componentType === "select" ? (
              <SelectComponent
                label={controlItem.label}
                options={controlItem.options}
                value={formData[controlItem.id]}
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    [controlItem.id]: event.target.value,
                  });
                }}
              />
            ) : null
          )}
          <img
            src={resivedImg}
            width={0}
            height={0}
            className='relative w-full h-full max-w-none max-h-none'
          />
        </div>
        <div className='text-right mt-8 space-x-6'>
          <button className=' rounded hover:text-gray-600 px-4 py-2 text-gray-500 text-sm font-medium' >Cancel</button>
          <button onClick={handleAddProduct} className='bg-green-500 hover:bg-green-600 rounded px-4 py-2 text-white text-sm font-medium' >Save</button>
        </div>
      </div>
    </>
  );
}

