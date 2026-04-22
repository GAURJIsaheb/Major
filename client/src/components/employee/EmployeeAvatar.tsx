import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const FALLBACK_AVATAR_SRC = "/avatar-placeholder.svg";

interface EmployeeAvatarProps {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    className?: string;
    textClassName?: string;
}

export default function EmployeeAvatar({
    firstName,
    lastName,
    profileImage,
    className = "h-9 w-9",
}: EmployeeAvatarProps) {
    const [hasImageError, setHasImageError] = useState(false);

    useEffect(() => {
        setHasImageError(false);
    }, [profileImage]);

    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const altText = displayName || "Employee avatar";
    const imageSrc = profileImage && !hasImageError ? profileImage : FALLBACK_AVATAR_SRC;

    return (
        <img
            src={imageSrc}
            alt={altText}
            title={altText}
            className={cn("rounded-full object-cover shrink-0 shadow-sm", className)}
            onError={() => {
                if (profileImage) {
                    setHasImageError(true);
                }
            }}
        />
    );
}
