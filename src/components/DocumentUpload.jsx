import React from 'react';

const DocumentUpload = ({ documents, onDocumentChange, onAddDocument, onRemoveDocument, errors }) => {
  const handleDocumentFieldChange = (index, field, value) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };
    onDocumentChange(updatedDocuments);
  };

  const handleFileChange = (index, file) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = { ...updatedDocuments[index], file };
    onDocumentChange(updatedDocuments);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
      
      {documents.map((doc, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Document {index + 1}</h4>
            {documents.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveDocument(index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name *
              </label>
              <input
                type="text"
                value={doc.fileName || ''}
                onChange={(e) => handleDocumentFieldChange(index, 'fileName', e.target.value)}
                placeholder="Enter file name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`doc${index}FileName`] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors[`doc${index}FileName`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`doc${index}FileName`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of File *
              </label>
              <select
                value={doc.fileType || ''}
                onChange={(e) => handleDocumentFieldChange(index, 'fileType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`doc${index}FileType`] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select type</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
              </select>
              {errors[`doc${index}FileType`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`doc${index}FileType`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Document *
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(index, e.target.files[0])}
                accept={doc.fileType === 'image' ? 'image/*' : doc.fileType === 'pdf' ? '.pdf' : ''}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`doc${index}File`] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors[`doc${index}File`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`doc${index}File`]}</p>
              )}
              {doc.file && (
                <p className="text-sm text-gray-600 mt-1">Selected: {doc.file.name}</p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={onAddDocument}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
      >
        Add Document
      </button>
      
      
      {documents.length < 2 && (
        <p className="text-red-500 text-sm mt-2">Please add at least 2 documents</p>
      )}
    </div>
  );
};

export default DocumentUpload;
