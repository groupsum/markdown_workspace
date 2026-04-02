import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ZoomControlProps {
    zoom: number;
    onZoom: (delta: number) => void;
    onReset?: () => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoom, onReset }) => {
    return (
        <div className="zoom-control">
            <button 
                onClick={() => onZoom(-0.1)} 
                className="zoom-btn" 
                title="Zoom Out"
            >
                <Minus size={12} />
            </button>
            <button
                type="button"
                className="zoom-display"
                title="Reset Zoom"
                onClick={onReset}
            >
                {Math.round(zoom * 100)}%
            </button>
            <button 
                onClick={() => onZoom(0.1)} 
                className="zoom-btn" 
                title="Zoom In"
            >
                <Plus size={12} />
            </button>
        </div>
    );
};
