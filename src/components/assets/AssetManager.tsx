import React, { useRef, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Image, Upload, Trash2, Copy, Check, FileImage } from 'lucide-react';
import type { Asset } from '../../types';

export const AssetManager: React.FC = () => {
  const { project, addAsset, deleteAsset } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newAsset: Asset = {
          id: `asset-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          size: file.size,
        };
        addAsset(newAsset);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyUrl = (asset: Asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    const imageNode = {
      type: 'image',
      tag: 'img',
      name: asset.name.split('.')[0] || 'Image Block',
      styles: { 'width': '100%', 'max-width': '400px', 'height': 'auto', 'border-radius': '8px' },
      attributes: {
        'src': asset.url,
        'alt': asset.name,
      },
    };
    e.dataTransfer.setData('application/json', JSON.stringify(imageNode));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none text-xs">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assets Library</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-sky-600 hover:bg-sky-500 text-white rounded p-1.5 transition flex items-center gap-1 font-semibold"
          title="Upload image asset"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {project.assets.length === 0 ? (
          <div className="h-48 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center text-slate-500 p-4 gap-2">
            <Image className="w-6 h-6 text-slate-700 animate-bounce" />
            <p className="font-bold text-[10px]">No assets uploaded yet</p>
            <p className="text-[9px] text-slate-600">
              Upload images or videos. Drag them directly onto the canvas to insert them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {project.assets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                className="group relative bg-slate-950 border border-slate-850 hover:border-sky-500/80 rounded-lg overflow-hidden flex flex-col cursor-grab active:cursor-grabbing transition"
              >
                {/* Image Preview thumbnail */}
                <div className="w-full h-24 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-850">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  ) : (
                    <FileImage className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                {/* Info & hover overlays */}
                <div className="p-2 flex flex-col min-w-0">
                  <span className="font-bold truncate text-[10px] text-slate-350" title={asset.name}>
                    {asset.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {(asset.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                {/* Overlay actions */}
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="p-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
                    title="Copy Base64 URL"
                  >
                    {copiedId === asset.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded text-slate-500 hover:text-red-400 transition"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
