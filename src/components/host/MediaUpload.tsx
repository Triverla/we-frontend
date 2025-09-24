"use client";

import { CloudUpload, X } from "lucide-react";

interface MediaUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: FileList) => void;
}

export const MediaUpload = ({ isOpen, onClose, onUpload }: MediaUploadProps) => {
    if (!isOpen) return null;

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            onUpload(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Media Upload</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                >
                    <div className="mx-auto w-12 h-12 mb-4">
                    <CloudUpload size={36} color="#5ae70d" strokeWidth={0.5} />
                    </div>
                    <p className="text-gray-600 mb-2">Drag your file(s) to start uploading</p>
                    <p className="text-sm text-gray-500 mb-4">OR</p>
                    <label className="cursor-pointer bg-[#06A2E2] text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-block">
                        Browse files
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) {
                                    onUpload(e.target.files);
                                }
                            }}
                            accept=".jpg,.jpeg,.png,.svg"
                            multiple
                        />
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                        Only support .jpg, .png and .svg
                    </p>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};