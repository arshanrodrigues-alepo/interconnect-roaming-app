'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadZoneProps {
  partnerId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  onUploadSuccess: () => void;
  onClose: () => void;
}

interface FileMetadata {
  partner_id?: string;
  partner_code?: string;
  partner_name?: string;
  direction?: 'INBOUND' | 'OUTBOUND';
  file_date?: string;
}

interface PartnerInfo {
  partner_id: string;
  partner_name: string;
  partner_code: string;
}

export default function FileUploadZone({
  partnerId: initialPartnerId,
  direction: initialDirection,
  onUploadSuccess,
  onClose,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [detectedPartner, setDetectedPartner] = useState<PartnerInfo | null>(null);
  const [useFileMetadata, setUseFileMetadata] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [partners, setPartners] = useState<PartnerInfo[]>([]);
  const [manualPartnerId, setManualPartnerId] = useState(initialPartnerId);
  const [manualDirection, setManualDirection] = useState(initialDirection);

  useEffect(() => {
    // Fetch partners list
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners');
        if (response.ok) {
          const data = await response.json();
          setPartners(data.partners || []);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      }
    };
    fetchPartners();
  }, []);

  const extractMetadataFromFile = async (file: File) => {
    try {
      // Only extract from JSON files
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (fileExt !== '.json') {
        return null;
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (data.metadata) {
        return data.metadata as FileMetadata;
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }
    return null;
  };

  const lookupPartner = async (metadata: FileMetadata): Promise<PartnerInfo | null> => {
    try {
      if (metadata.partner_id) {
        const response = await fetch(`/api/partners/${metadata.partner_id}`);
        if (response.ok) {
          const data = await response.json();
          return data.partner || data;
        }
      } else if (metadata.partner_code) {
        const response = await fetch('/api/partners');
        if (response.ok) {
          const data = await response.json();
          const partner = (data.partners || []).find(
            (p: PartnerInfo) => p.partner_code === metadata.partner_code
          );
          return partner || null;
        }
      }
    } catch (error) {
      console.error('Error looking up partner:', error);
    }
    return null;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      const validTypes = ['.csv', '.json', '.tap', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(fileExt)) {
        setError(`Invalid file type. Supported formats: ${validTypes.join(', ')}`);
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size exceeds 100MB limit');
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Try to extract metadata
      const metadata = await extractMetadataFromFile(file);
      setFileMetadata(metadata);

      if (metadata) {
        const partner = await lookupPartner(metadata);
        setDetectedPartner(partner);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use file metadata if enabled and available, otherwise use manual selection
      if (useFileMetadata && fileMetadata) {
        if (fileMetadata.partner_id) {
          formData.append('partner_id', fileMetadata.partner_id);
        } else if (fileMetadata.partner_code) {
          formData.append('partner_code', fileMetadata.partner_code);
        }
        if (fileMetadata.direction) {
          formData.append('direction', fileMetadata.direction);
        }
      } else {
        formData.append('partner_id', manualPartnerId);
        formData.append('direction', manualDirection);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/tap/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setTimeout(() => {
        onUploadSuccess();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt', '.tap'],
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload TAP File</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer ${
            uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300'
          }`}
          style={isDragActive ? { borderColor: '#1f3d88', backgroundColor: '#e8edf7' } : !uploading ? {} : undefined}
          onMouseEnter={(e) => !uploading && !isDragActive && (e.currentTarget.style.backgroundColor = '#e8edf7', e.currentTarget.style.borderColor = '#4a6bb5')}
          onMouseLeave={(e) => !uploading && !isDragActive && (e.currentTarget.style.backgroundColor = '', e.currentTarget.style.borderColor = '')}
        >
          <input {...getInputProps()} disabled={uploading} />

          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#1f3d88' }}></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%`, backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isDragActive ? (
                <p className="text-lg font-medium" style={{ color: '#1f3d88' }}>Drop the file here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag and drop TAP file here
                  </p>
                  <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                  <p className="text-xs text-gray-500">
                    Supported formats: CSV, JSON, TAP, TXT (max 100MB)
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {/* Metadata Detection Info */}
        {selectedFile && fileMetadata && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-green-800 flex-1">
                <p className="font-semibold mb-2">Metadata Detected in File:</p>
                {detectedPartner ? (
                  <>
                    <p>Partner: <span className="font-medium">{detectedPartner.partner_name}</span> ({detectedPartner.partner_code})</p>
                    <p>Direction: <span className="font-medium">{fileMetadata.direction || 'Not specified'}</span></p>
                  </>
                ) : (
                  <p className="text-yellow-700">
                    Partner code "{fileMetadata.partner_code}" not found in database
                  </p>
                )}

                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="useFileMetadata"
                    checked={useFileMetadata}
                    onChange={(e) => setUseFileMetadata(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="useFileMetadata" className="cursor-pointer">
                    Use metadata from file
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Override Section */}
        {selectedFile && (!fileMetadata || !useFileMetadata) && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-3">Manual Selection:</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner
                </label>
                <select
                  value={manualPartnerId}
                  onChange={(e) => setManualPartnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#1f3d88' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  disabled={uploading}
                >
                  {partners.map((p) => (
                    <option key={p.partner_id} value={p.partner_id}>
                      {p.partner_name} ({p.partner_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction
                </label>
                <select
                  value={manualDirection}
                  onChange={(e) => setManualDirection(e.target.value as 'INBOUND' | 'OUTBOUND')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#1f3d88' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#1f3d88'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  disabled={uploading}
                >
                  <option value="INBOUND">Inbound</option>
                  <option value="OUTBOUND">Outbound</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && !uploading && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="w-full px-6 py-3 text-white rounded-lg font-semibold transition"
              style={{ backgroundImage: 'linear-gradient(to right, #1f3d88, #1f8888)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #163368, #178080)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1f3d88, #1f8888)'}
            >
              Upload and Process File
            </button>
          </div>
        )}

        {/* Info Section */}
        {!selectedFile && (
          <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: '#e8edf7', borderColor: '#a3b9df', borderWidth: '1px' }}>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
                style={{ color: '#1f3d88' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm" style={{ color: '#0f2550' }}>
                <p className="font-semibold mb-2">Tip: Embed Partner Info in JSON Files</p>
                <p className="mb-2">
                  For JSON files, you can include metadata to auto-detect the partner:
                </p>
                <pre className="bg-white rounded p-2 text-xs overflow-x-auto" style={{ borderColor: '#a3b9df', borderWidth: '1px' }}>
{`{
  "metadata": {
    "partner_code": "USAVZ1",
    "direction": "INBOUND"
  },
  "records": [...]
}`}
                </pre>
                <p className="mt-2 text-xs">
                  File will be parsed and rated automatically after upload.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
