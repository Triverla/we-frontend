"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@woothomes/lib/utils";
import { PrimaryButton } from "./primaryButton";

type ModalButton = {
    label:  React.ReactNode;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary" | "danger";
    disabled?: boolean;
    isLoading?: boolean;
};

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    header: string;
    message: React.ReactNode;
    buttons: ModalButton[];
};

export const Modal = ({ isOpen, onClose, header, message, buttons }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                <button onClick={onClose} className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
                <div className="p-1">
                    <h2 className="text-xl font-semibold text-center mt-5 mb-2">{header}</h2>
                    <div className="text-center text-gray-600 mb-6">{message}</div>
                    <div className={cn("flex justify-center gap-3", buttons.length === 1 && "justify-center")}>
                        {buttons.map((btn, idx) => (
                            <PrimaryButton
                                key={idx}
                                variant={btn.variant ?? "primary"}
                                onClick={btn.onClick}
                                className={cn(buttons.length === 1 ? "px-10" : "flex-1")}
                                disabled={btn.disabled}
                                isLoading={btn.isLoading}
                            >
                                {btn.label}
                            </PrimaryButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
