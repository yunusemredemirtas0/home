import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import { FiCheck, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';

const ImageEditorModal = ({ imageSrc, onCancel, onSave, aspect = 16 / 9 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onSave(croppedBlob);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                position: 'relative',
                flex: 1,
                background: '#333'
            }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>

            <div style={{
                padding: '1.5rem',
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: '1px solid #333'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
                    <FiZoomOut />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                    />
                    <FiZoomIn />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', background: '#333', color: 'white', border: 'none' }}
                    >
                        <FiX /> Vazgeç
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary-action"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        <FiCheck /> {loading ? 'İşleniyor...' : 'Kırp ve Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
