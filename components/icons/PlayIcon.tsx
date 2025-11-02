
import React from 'react';
import { Icon } from './Icon';

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.411.75 1.559 0 1.97l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
    </Icon>
);
   