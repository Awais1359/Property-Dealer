import React, { useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  accept?: string;
  multiple?: boolean;
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx',
  multiple = true,
  label
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const fileUrls = selectedFiles.map(file => URL.createObjectURL(file));
    
    if (multiple) {
      onFilesChange([...files, ...fileUrls]);
    } else {
      onFilesChange(fileUrls.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-6 h-6" />;
    }
    return <FileText className="w-6 h-6" />;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Click to select files</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <span className="text-sm text-gray-700 truncate">File {index + 1}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;