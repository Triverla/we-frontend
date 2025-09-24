import React from "react";
import Image from "next/image";

interface SocialAuthButtonProps {
    provider: "google" | "facebook";
    onClick?: () => void;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({ provider, onClick }) => {
    const getProviderStyles = () => {
        switch (provider) {
            case "google":
                return {
                    bgColor: "bg-white",
                    hoverBgColor: "hover:bg-gray-50",
                    textColor: "text-[#1E3A8A]",
                    borderColor: "border-[#1E3A8A]",
                    icon: (
                        <Image
                            src="/icon/google.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                    ),
                };
            case "facebook":
                return {
                    bgColor: "bg-white",
                    hoverBgColor: "hover:bg-gray-50",
                    textColor: "text-[#1E3A8A]",
                    borderColor: "border-[#1E3A8A]",
                    icon: (
                        <Image
                            src="/icon/facebook.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                    ),
                };
        }
    };

    const styles = getProviderStyles();

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full cursor-pointer flex items-center gap-3 p-3 ${styles.bgColor} ${styles.textColor} ${styles.hoverBgColor} border ${styles.borderColor} rounded-md transition-all duration-300`}
        >
            <div className="flex items-center">
                {styles.icon}
            </div>
            <div className="flex-1 text-center">
                Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </div>
        </button>
    );
};