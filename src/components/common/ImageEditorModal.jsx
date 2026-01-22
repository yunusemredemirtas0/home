import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import { FiCheck, FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiSliders, FiCrop, FiImage } from 'react-icons/fi';

const ImageEditorModal = ({ imageSrc, onCancel, onSave, aspect = 16 / 9, cropShape = 'rect' }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [activeTab, setActiveTab] = useState('crop'); // 'crop' | 'filter'
    const [filters, setFilters] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: false,
        sepia: false
    });

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, filters);
            onSave(croppedBlob);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filterPresets = [
        { name: 'Normal', filter: {} },
        { name: 'S&B', filter: { grayscale: true } },
        { name: 'Sepia', filter: { sepia: true } },
        { name: 'Vivid', filter: { contrast: 125, saturation: 130 } },
        { name: 'Dim', filter: { brightness: 80 } },
    ];

    const applyPreset = (preset) => {
        setFilters({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            grayscale: false,
            sepia: false,
            ...preset.filter
        });
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiCrop /> Fotoğrafı Düzenle
                    </h3>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div style={{ position: 'relative', height: '300px', background: '#111' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        cropShape={cropShape}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        style={{
                            containerStyle: {
                                filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) ${filters.grayscale ? 'grayscale(100%)' : ''} ${filters.sepia ? 'sepia(100%)' : ''}`
                            }
                        }}
                    />
                </div>

                {/* Controls Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab('crop')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'crop' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'crop' ? '2px solid var(--accent-color)' : 'none', color: activeTab === 'crop' ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        <FiRotateCw style={{ marginRight: '0.5rem' }} /> Kırp & Döndür
                    </button>
                    <button
                        onClick={() => setActiveTab('filter')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'filter' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'filter' ? '2px solid var(--accent-color)' : 'none', color: activeTab === 'filter' ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        <FiSliders style={{ marginRight: '0.5rem' }} /> Efektler
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'crop' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>Yakınlaştır</span>
                                    <span>{(zoom * 100).toFixed(0)}%</span>
                                </label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>Döndür</span>
                                    <span>{rotation}°</span>
                                </label>
                                <input
                                    type="range"
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                            {filterPresets.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-primary)',
                                        cursor: 'pointer',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* FooterActions */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>İptal</button>
                    <button onClick={handleSave} disabled={loading} className="btn-primary-action" style={{ flex: 1 }}>
                        <FiCheck /> {loading ? '...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
