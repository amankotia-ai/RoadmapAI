import React from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, Search, AlertCircle, Loader2, Check } from 'lucide-react';
import { Navigation, Footer } from '@/components/ui';
import { VectorStorageService, DocumentMetadata } from '@/services/VectorStorageService';
import { useAuth } from '@/hooks';
import { Navigate } from 'react-router-dom';

const vectorStorage = new VectorStorageService();

const documentTypes = [
  'PRD',
  'Front End',
  'Back End',
  'API Guide',
  'Implementation Flow',
  'Guide',
  'Prompting',
  'QA'
];

export function VectorAdmin() {
  const { user, isLoading } = useAuth();
  const [content, setContent] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [documentType, setDocumentType] = React.useState(documentTypes[0]);
  const [category, setCategory] = React.useState('Documentation');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Array<{
    content: string;
    metadata: DocumentMetadata;
    similarity: number;
  }>>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C3737]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleUpload = async () => {
    if (!content.trim() || !title.trim()) {
      setUploadStatus({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({});

    try {
      const result = await vectorStorage.uploadDocument(content, {
        title,
        documentType,
        category
      });

      if (result.success) {
        setUploadStatus({
          success: true,
          message: 'Document uploaded successfully'
        });
        // Clear form
        setContent('');
        setTitle('');
        setDocumentType(documentTypes[0]);
        setCategory('Documentation');
      } else {
        setUploadStatus({
          success: false,
          message: result.error || 'Failed to upload document'
        });
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: 'An error occurred while uploading'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await vectorStorage.searchSimilar(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navigation />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Database className="w-6 h-6 text-[#3C3737]" />
          <h1 className="text-3xl font-bold text-gray-900">Vector Storage Admin</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-5 h-5 text-[#3C3737]" />
              <h2 className="text-xl font-semibold">Upload Document</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Document category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Document content..."
                />
              </div>

              {uploadStatus.message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    uploadStatus.success
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {uploadStatus.success ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {uploadStatus.message}
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  isUploading
                    ? 'bg-[#3C3737]/75 cursor-not-allowed'
                    : 'bg-[#3C3737] hover:bg-[#3C3737]/90'
                } transition-colors`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload Document'
                )}
              </button>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-5 h-5 text-[#3C3737]" />
              <h2 className="text-xl font-semibold">Search Documents</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search query..."
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    isSearching || !searchQuery.trim()
                      ? 'bg-[#3C3737]/75 cursor-not-allowed'
                      : 'bg-[#3C3737] hover:bg-[#3C3737]/90'
                  } transition-colors`}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              <div className="space-y-4 mt-4">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {result.metadata.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {result.metadata.documentType}
                      </span>
                      {result.metadata.category && (
                        <span className="inline-block ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {result.metadata.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {result.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}