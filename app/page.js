"use client";

import InputComponent from "./components/FormElements/InputComponent";
import * as Dialog from '@radix-ui/react-dialog';
import SelectComponent from "./components/FormElements/SelectComponent";
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
  uploadBytesResumable,
} from "firebase/storage";
import ImageCrop from "./imageCrop";
import { useContext, useEffect, useState } from "react";

import { resolve } from "styled-jsx/css";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, firebaseStroageURL);

const createUniqueFileName = (getFile) => {
  const timeStamp = Date.now();
  const randomStringValue = Math.random().toString(36).substring(2, 12);

  return `${getFile.name}-${timeStamp}-${randomStringValue}`;
};

async function helperForUPloadingImageToFirebase(file) {
  const getFileName = createUniqueFileName(file);
  const storageReference = ref(storage, `ecommerce/${getFileName}`);
  const uploadImage = uploadBytesResumable(storageReference, file);

  return new Promise((resolve, reject) => {
    uploadImage.on(
      "state_changed",
      (snapshot) => { },
      (error) => {
        console.log(error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadImage.snapshot.ref)
          .then((downloadUrl) => resolve(downloadUrl))
          .catch((error) => reject(error));
      }
    );
  });
}

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
  const [base64Data, setBase64Data] = useState()
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

  useEffect(() => {
    if (currentUpdatedProduct !== null) setFormData(currentUpdatedProduct);
  }, [currentUpdatedProduct]);

  async function handleImage(event) {
    const extractImageUrl = await helperForUPloadingImageToFirebase(
      event.target.files[0]
    );


    if (extractImageUrl !== "") {
      if (imageA.length > 5) {
        return;
      }
      else { setImageA([...imageA, extractImageUrl]) }
    }

  }

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
          <Dialog.Content className='fixed z-10 w-full max-w-md sm:max-w-xs top-1/2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-8 text-gray-900 shadow'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl'>Adding Product</h2>
              <Dialog.Close className='text-gray-400 hover:text-gray-500'>
                exit
              </Dialog.Close>
            </div>
            <div className="mt-8 space-y-6">

              <div className="px-4 py-5">
                <div className="relative">
                  <h2 className="font-semibold text-start text-gray-900">Add 5 0r Less Pictures</h2>
                  <div className="absolute inset-y-0 right-0">
                    <button type="submit" onClick={handleImage} className="font-medium text-sky-500">
                      Save
                    </button>
                  </div>
                </div>
              </div>
              {
                base64Data ?
                  (
                    <ImageCrop src={base64Data} />
                  ) :
                  (<div className="p-3 h-auto">
                    <div className="relative rounded-full aspect-[1]">
                      <button className="absolute inset-0 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-full aspect-[1]">
                        <div className="w-24 h-24 text-gray-200">+</div>
                      </button>
                    </div>
                  </div>)
              }
              <input
                accept="image/*"
                max="1000000"
                type="file"
                onChange={(e) => {
                  uploadImage(e);
                }}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="mx-2">
        <div className="w-full max-w-md sm:max-w-xs rounded-md bg-[#0e7490] p-4 text-gray-900 shadow mt-8 space-y-6 ">
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
        </div>
        <div className='text-right mt-8 space-x-6'>
          <button className=' rounded hover:text-gray-600 px-4 py-2 text-gray-500 text-sm font-medium' >Cancel</button>
          <button onClick={handleAddProduct} className='bg-green-500 hover:bg-green-600 rounded px-4 py-2 text-white text-sm font-medium' >Save</button>
        </div>
      </div>
    </>
  );
}

