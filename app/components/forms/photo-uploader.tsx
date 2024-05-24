import { Form } from "@remix-run/react"
import { ChangeEvent, useRef, useState } from "react"

interface PLPhotoUploaderProps {
  shape?: 'circle' | 'square'
  size?: 'small' | 'medium' | 'large'
  currentImageUrl: string|null
}

export function PLPhotoUploader({shape='circle', size='small', currentImageUrl }: PLPhotoUploaderProps) {
  const [file, setFile] = useState<File | string | null>(currentImageUrl)
  const formRef = useRef<HTMLFormElement>(null)
  const containerShapeClass = `${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center `
  const containerSizeClass = `${size === 'small' ? 'w-16 h-16' : size === 'medium' ? 'w-32 h-32' : 'w-48 h-48'} `
  const storeFile = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (!files) return
    const file = files[0]
    file.stream
    setFile(file)  
    formRef.current?.submit()
  }
  return (
    <Form method="PUT" ref={formRef} encType="multipart/form-data" >
      <label htmlFor="logoFile" className={containerShapeClass + containerSizeClass + 'border-2 bg-white cursor-pointer border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50'}>
        {file ? (
          <>
          <img src={typeof file === 'string' ? file : URL.createObjectURL(file)} alt="logo" className="w-full h-full object-cover rounded-md opacity-60"/>
          <i className="ri-image-add-line text-2xl text-black absolute"></i>
          </>
        ) : (
          <i className="ri-image-add-line text-2xl text-black"></i>
        )}
      </label>
      <input type="file" onChange={(e) => storeFile(e)} placeholder="Choose a logo" className="hidden" id="logoFile" name="logoFile"/>
    </Form>
  )
}