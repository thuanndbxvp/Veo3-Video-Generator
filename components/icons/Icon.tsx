
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    children: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({ children, className, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className || "w-6 h-6"}
        {...props}
    >
        {children}
    </svg>
);
   