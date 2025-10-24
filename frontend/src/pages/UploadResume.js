import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const UploadResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobText, setJobText] = useState('');
  const [domain, setDomain] = useState('Fullstack');
  const [isUploading, setIsUploading] = useState(false);

  const domains = [
    { value: 'Fullstack', label: 'Full Stack Development' },
    { value: 'Cloud', label: 'Cloud Engineering' },
    { value: 'Data', label: 'Data Science & Analytics' },
    { value: 'DevOps', label: 'DevOps & Infrastructure' },
  ];

  const onDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      toast.success('File uploaded successfully!');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload a resume file');
      return;
    }
    
    if (!jobText.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobText', jobText);
      formData.append('domain', domain);

      const response = await axios.post('/api/uploadResume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume analyzed successfully!');
      navigate(`/results/${response.data.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload your resume and job description to get AI-powered matching analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume File</h2>
          
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop your resume here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Job Description Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the job description you want to match against..."
            className="textarea-field"
            rows={8}
            required
          />
        </div>

        {/* Domain Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Domain</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {domains.map((domainOption) => (
              <label
                key={domainOption.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  domain === domainOption.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="domain"
                  value={domainOption.value}
                  checked={domain === domainOption.value}
                  onChange={(e) => setDomain(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-medium">{domainOption.value}</div>
                  <div className="text-sm opacity-75">{domainOption.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isUploading || !file || !jobText.trim()}
            className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader className="inline h-5 w-5 mr-2 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Upload className="inline h-5 w-5 mr-2" />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadResume;
