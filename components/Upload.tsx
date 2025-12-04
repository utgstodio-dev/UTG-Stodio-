import React, { useState } from 'react';
import { Upload as UploadIcon, Video, Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { ContentType } from '../types';
import { checkCopyrightContent } from '../services/geminiService';

interface UploadProps {
  onUploadComplete: (type: ContentType, url: string, description: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContentType>(ContentType.POST);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyrightStatus, setCopyrightStatus] = useState<'pending' | 'checking' | 'safe' | 'violation'>('pending');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      // Auto-detect type roughly
      if (selectedFile.type.startsWith('video')) {
          setType(ContentType.VIDEO); // Could be short if duration check, but default to video
      } else {
          setType(ContentType.POST);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) return;

    setUploading(true);
    setCopyrightStatus('checking');

    // Simulate Copyright Check with Gemini
    const isViolation = await checkCopyrightContent(description);
    
    if (isViolation) {
        setCopyrightStatus('violation');
        setUploading(false);
        return;
    }

    setCopyrightStatus('safe');

    // Simulate Upload Progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploading(false);
        onUploadComplete(type, preview, description);
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  };

  return (
    <div className="pt-20 pb-24 px-4 min-h-screen bg-gray-50 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-green-600 mb-6">Create Content</h2>

      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        {/* File Drop / Preview */}
        <div className="mb-6">
          {preview ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-black max-h-80 flex justify-center">
              {type === ContentType.POST ? (
                <img src={preview} alt="Preview" className="object-contain h-64" />
              ) : (
                <video src={preview} className="object-contain h-64" controls />
              )}
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-10 h-10 mb-3 text-green-500" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> Video, Short, or Image</p>
                <p className="text-xs text-gray-500">MP4, JPG, PNG</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
            </label>
          )}
        </div>

        {/* Type Selection */}
        <div className="flex space-x-4 mb-4 justify-center">
           <button 
             onClick={() => setType(ContentType.VIDEO)}
             className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${type === ContentType.VIDEO ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                <Video size={16} className="mr-2"/> Video
           </button>
           <button 
             onClick={() => setType(ContentType.SHORT)}
             className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${type === ContentType.SHORT ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                <Video size={16} className="mr-2 rotate-90"/> Short
           </button>
           <button 
             onClick={() => setType(ContentType.POST)}
             className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${type === ContentType.POST ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                <ImageIcon size={16} className="mr-2"/> Post
           </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900">Description</label>
          <textarea 
            rows={3} 
            className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500" 
            placeholder="Write a catchy caption..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        
        {/* Warnings */}
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-start">
             <AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0" />
             <p>
                <strong>Data Usage Warning:</strong> Uploading uses your mobile data plan. 
                Ensure you have sufficient MB/GB available.
                <br/>
                <strong>Copyright Policy:</strong> Re-uploading others' content will result in immediate deletion of the content from your channel.
             </p>
        </div>

        {/* Action Button */}
        {copyrightStatus === 'violation' ? (
             <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                 <p className="font-bold">Copyright Violation Detected!</p>
                 <p className="text-sm">This content cannot be uploaded.</p>
             </div>
        ) : (
            <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full text-white font-medium rounded-lg text-sm px-5 py-3 text-center transition ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
            {uploading ? (
                <div className="flex items-center justify-center">
                    <div className="w-full bg-green-800 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div className="bg-green-300 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    {Math.round(progress)}%
                </div>
            ) : "Upload"}
            </button>
        )}
      </div>
    </div>
  );
};

export default Upload;