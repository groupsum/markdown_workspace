import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ZoomControlProps {
    zoom: number;
    onZoom: (delta: number) => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoom }) => {
    return (
        <div className="zoom-control">
            <button 
                onClick={() => onZoom(-0.1)} 
                className="zoom-btn" 
                title="Zoom Out"
            >
                <Minus size={12} />
            </button>
            <div className="zoom-display">
                {Math.round(zoom * 100)}%
            </div>
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