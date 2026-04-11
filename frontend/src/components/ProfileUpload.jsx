import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function ProfileUpload({ teacherId, onUploadSuccess, onSkip }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select an image file first.');
            return;
        }

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('profileImage', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/teacher/upload-profile-image/${teacherId}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            onUploadSuccess(data.profileImage);
        } catch (err) {
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[440px] mx-auto text-center">
            <section className="w-full px-6 sm:px-8 md:px-12 py-10 md:py-14 glass-card flex flex-col gap-6 md:gap-8 rounded-[28px] md:rounded-[32px]">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Complete Your Profile</h2>
                    <p className="text-sm text-brand-navy/70">Upload a professional photo to be displayed on your portal.</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="relative group w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-brand-cream cursor-pointer transition-transform hover:scale-105">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-brand-blue/50">
                                <UploadCloud size={32} />
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    {error && (
                        <div className="p-3 w-full rounded-2xl bg-red-600/10 border border-red-600/16 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 w-full">
                        <button 
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="premium-button flex items-center justify-center gap-2"
                        >
                            {isUploading ? 'Uploading...' : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Save Profile Picture
                                </>
                            )}
                        </button>
                        <button 
                            onClick={onSkip}
                            disabled={isUploading}
                            className="text-sm font-semibold text-brand-navy/60 hover:text-brand-navy transition-colors py-2"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ProfileUpload;
