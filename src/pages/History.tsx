import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Navigation, DocumentModal, Footer } from '@/components/ui';
import { usePrompts, useAuth } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocumentConfig } from '@/lib/documentTypes';
import { Link, Navigate } from 'react-router-dom';
import { IdeaDocument } from '@/services/types';

export function History() {
  const { user, isLoading } = useAuth();
  const { ideas, isLoading: isIdeasLoading, error } = usePrompts();
  const isPageLoading = isLoading || isIdeasLoading;
  const [selectedDocument, setSelectedDocument] = React.useState<IdeaDocument | null>(null);

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

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="bg-red-50 text-red-800 rounded-lg p-4 max-w-lg mx-auto mb-8">
        <h3 className="text-lg font-medium mb-2">Connection Error</h3>
        <p className="text-sm">{error?.message || 'Failed to load ideas. Please try again.'}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3C3737] text-white hover:bg-[#3C3737]/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm font-medium">Retry</span>
      </button>
    </motion.div>
  );

  const SkeletonIdea = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <Skeleton className="h-7 w-2/3 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
            <Skeleton className="w-5 h-5 rounded-full" />
            <div className="flex-grow">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navigation />
      <div className="min-h-screen">
        {isPageLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C3737]" />
              <p className="text-sm text-gray-600">Loading your ideas...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg mx-auto text-center py-12"
          >
            <div className="bg-red-50 text-red-800 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium mb-2">Connection Error</h3>
              <p className="text-sm">{error.message}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3C3737] text-white hover:bg-[#3C3737]/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Retry</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#3C3737]" />
                <h1 className="text-3xl font-bold text-gray-900">Your Ideas</h1>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3C3737] text-white hover:bg-[#3C3737]/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">New Idea</span>
              </Link>
            </div>

            <div className="space-y-6">
              {error && renderError()}

              {isPageLoading && (
                <>
                  <SkeletonIdea />
                  <SkeletonIdea />
                  <SkeletonIdea />
                </>
              )}

              {ideas.map((idea) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {idea.title}
                    </h2>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {new Date(idea.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {idea.documents?.length || 0} documents
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          idea.is_public 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {idea.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {idea.documents && idea.documents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {idea.documents.map((doc) => {
                        const { icon: Icon, displayName } = getDocumentConfig(doc.document_type);
                        return (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedDocument(doc)}
                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
                          >
                            <div className="flex-shrink-0">
                              <Icon className="w-5 h-5 text-[#3C3737]" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {displayName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}

              {!isPageLoading && !error && ideas.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Start a new conversation to begin documenting your ideas
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3C3737] text-white hover:bg-[#3C3737]/90 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Create Your First Idea</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        <DocumentModal
          doc={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      </div>
      <Footer />
    </div>
  );
}