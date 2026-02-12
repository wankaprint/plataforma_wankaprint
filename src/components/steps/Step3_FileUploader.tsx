'use client';

import { useState, useRef } from 'react';
import { usePurchaseStepper } from '@/contexts/PurchaseStepperContext';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, FileText, Image as ImageIcon, File as FileIcon, CheckCircle } from 'lucide-react';

export default function Step3_FileUploader() {
    const {
        designFiles,
        addDesignFiles,
        removeDesignFile,
        uploadProgress,
        designFileUrls,
        nextStep,
        previousStep
    } = usePurchaseStepper();

    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>(designFileUrls);
    const [localProgress, setLocalProgress] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const validTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
            return validTypes.some(type => file.type.startsWith(type)) || file.type.includes('word');
        });

        if (validFiles.length === 0) {
            alert('Por favor selecciona archivos válidos (Imágenes, PDF, Word)');
            return;
        }

        addDesignFiles(validFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const uploadFilesToSupabase = async () => {
        if (designFiles.length === 0) {
            alert('Por favor selecciona al menos un archivo');
            return;
        }

        setUploading(true);
        const supabase = createClient();
        const timestamp = Date.now();
        const folderPath = `pedido_${timestamp}`;
        const urls: string[] = [];

        try {
            for (const file of designFiles) {
                const ext = file.name.split('.').pop();
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filename = `${folderPath}/${Date.now()}_${sanitizedName}`;

                // Simulate progress (Supabase SDK doesn't have real progress callback)
                setLocalProgress(prev => ({ ...prev, [file.name]: 0 }));

                const progressInterval = setInterval(() => {
                    setLocalProgress(prev => {
                        const current = prev[file.name] || 0;
                        if (current >= 90) {
                            clearInterval(progressInterval);
                            return prev;
                        }
                        return { ...prev, [file.name]: current + 10 };
                    });
                }, 200);

                const { data, error } = await supabase.storage
                    .from('designs')
                    .upload(filename, file);

                clearInterval(progressInterval);

                if (error) {
                    console.error('Error uploading file:', file.name, error);
                    setLocalProgress(prev => ({ ...prev, [file.name]: -1 })); // Error state
                    continue;
                }

                setLocalProgress(prev => ({ ...prev, [file.name]: 100 }));

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('designs')
                    .getPublicUrl(filename);

                urls.push(publicUrl);
            }

            setUploadedFiles(urls);

            // Small delay to show 100% progress
            setTimeout(() => {
                nextStep();
            }, 500);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al subir archivos. Por favor intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <ImageIcon className="text-blue-500" size={20} />;
        } else if (ext === 'pdf') {
            return <FileText className="text-red-500" size={20} />;
        }
        return <FileIcon className="text-gray-500" size={20} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sube tus archivos de diseño</h2>
                <p className="text-gray-600">Imágenes, PDF o archivos de Word</p>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer
          ${isDragging
                        ? 'border-[#742384] bg-purple-50'
                        : designFiles.length > 0
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-[#742384] hover:bg-purple-50'
                    }
        `}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${designFiles.length > 0 ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                        {designFiles.length > 0 ? (
                            <CheckCircle className="text-green-600" size={32} />
                        ) : (
                            <Upload className="text-[#742384]" size={32} />
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                            {designFiles.length > 0
                                ? `${designFiles.length} archivo(s) seleccionado(s)`
                                : 'Arrastra archivos aquí o haz clic para seleccionar'
                            }
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Formatos: JPG, PNG, PDF, DOCX (Máx. 10 archivos)
                        </p>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {designFiles.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
                    <h3 className="font-bold text-lg text-gray-900">Archivos Seleccionados</h3>

                    {designFiles.map((file) => {
                        const progress = localProgress[file.name] || 0;
                        const isError = progress === -1;
                        const isComplete = progress === 100;

                        return (
                            <div
                                key={file.name}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                            >
                                {getFileIcon(file.name)}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                                    {/* Progress Bar */}
                                    {uploading && (
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${isError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-[#742384]'
                                                    }`}
                                                style={{ width: `${Math.max(0, progress)}%` }}
                                            />
                                        </div>
                                    )}

                                    {uploading && (
                                        <p className="text-xs mt-1 font-medium">
                                            {isError ? (
                                                <span className="text-red-500">Error al subir</span>
                                            ) : isComplete ? (
                                                <span className="text-green-600">✓ Completado</span>
                                            ) : (
                                                <span className="text-[#742384]">Subiendo... {progress}%</span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {!uploading && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeDesignFile(file.name);
                                        }}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <X className="text-red-500" size={20} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={previousStep}
                    disabled={uploading}
                    className="border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Atrás
                </button>

                <button
                    onClick={uploadFilesToSupabase}
                    disabled={designFiles.length === 0 || uploading}
                    className="bg-[#742384] hover:bg-[#5a1b66] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subiendo...
                        </>
                    ) : (
                        <>
                            Subir y Continuar
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
