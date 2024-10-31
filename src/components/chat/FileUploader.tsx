import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

export default function FileUploader({ onFileSelect, onClose }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
      onClose();
    }
  }, [onFileSelect, onClose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload File</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          }`}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Images</p>
              </div>
              <div className="text-center">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
            
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">
              Drag and drop your files here or{' '}
              <label
                htmlFor="file-upload"
                className="text-purple-500 hover:text-purple-600 cursor-pointer"
              >
                browse
              </label>
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: Images, Videos, Documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}