import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useProcessorStore } from '../store/processor';
import { PreviewTable } from './PreviewTable';

export const FileUpload: React.FC = () => {
  const { setStatus, resetStatus } = useProcessorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  
  const handleDownload = useCallback(() => {
    if (!processedData) return;
    
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'processed_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedData]);
  
  const processFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setProcessedData(null);
      resetStatus();
      setStatus({ stage: 'Reading CSV file...' });
      
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            setStatus({ stage: 'Initializing processing...', progress: 5 });
            
            const worker = new Worker(
              new URL('../workers/csvProcessor.worker.ts', import.meta.url),
              { type: 'module' }
            );
            
            worker.onmessage = (e) => {
              if (e.data.type === 'progress') {
                setStatus({
                  progress: e.data.progress,
                  eta: e.data.eta,
                  stage: e.data.stage
                });
              } else if (e.data.type === 'complete') {
                setStatus({
                  progress: 100,
                  isComplete: true,
                  stage: 'Processing complete'
                });
                setProcessedData(e.data.data);
                setIsProcessing(false);
              } else if (e.data.type === 'error') {
                setStatus({
                  error: e.data.error,
                  isComplete: true,
                  stage: 'Error occurred'
                });
                setIsProcessing(false);
              }
            };
            
            worker.onerror = (error) => {
              setStatus({
                error: error.message,
                isComplete: true,
                stage: 'Error occurred'
              });
              setIsProcessing(false);
            };
            
            worker.postMessage(results.data);
          } catch (error) {
            setStatus({
              error: error instanceof Error ? error.message : 'An error occurred',
              isComplete: true,
              stage: 'Error occurred'
            });
            setIsProcessing(false);
          }
        },
        error: (error) => {
          setStatus({
            error: error.message,
            isComplete: true,
            stage: 'Error parsing CSV'
          });
          setIsProcessing(false);
        }
      });
    } catch (error) {
      setStatus({
        error: error instanceof Error ? error.message : 'An error occurred',
        isComplete: true,
        stage: 'Error occurred'
      });
      setIsProcessing(false);
    }
  }, [setStatus, resetStatus]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !isProcessing) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile, isProcessing]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isProcessing
  });
  
  return (
    <>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-600">
          {isDragActive
            ? "Drop the CSV file here"
            : isProcessing
            ? "Processing file..."
            : "Drag & drop a CSV file here, or click to select"}
        </p>
      </div>
      
      {processedData && (
        <PreviewTable 
          data={processedData} 
          onDownload={handleDownload}
        />
      )}
    </>
  );
};