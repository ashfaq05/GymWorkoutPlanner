import React, { useState, useRef } from 'react';
import { Exercise, MuscleCategory, ExerciseClipartKey } from '../types';
import { ExerciseImage } from './ExerciseImage';
import { ExerciseClipart } from './ExerciseClipart';
import { resizeImageFile, isGifUrl } from '../utils/imageUtils';
import { isValidYouTubeUrl, getYouTubeEmbedUrl } from '../utils/youtube';
import { CATEGORIES } from '../data/defaultPlan';
import {
  X,
  Upload,
  Link,
  Trash2,
  Check,
  Youtube,
  AlertCircle,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ExerciseEditModalProps {
  exercise: Exercise;
  onSave: (updated: Exercise) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({
  exercise,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(exercise.name);
  const [target, setTarget] = useState(exercise.target);
  const [category, setCategory] = useState<MuscleCategory>(exercise.category);
  const [sets, setSets] = useState(exercise.defaultSets || 3);
  const [repRange, setRepRange] = useState(exercise.repRange || '8–12');
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds || 90);
  const [notes, setNotes] = useState(exercise.notes || '');
  const [clipartType, setClipartType] = useState<ExerciseClipartKey>(exercise.clipartType || 'default-exercise');

  // Media
  const [customImageUrl, setCustomImageUrl] = useState<string>(exercise.customImageUrl || '');
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState(exercise.youtubeUrl || '');
  const [youtubeInput, setYoutubeInput] = useState(exercise.youtubeUrl || '');
  const [youtubeError, setYoutubeError] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setImageError(false);
      const dataUrl = await resizeImageFile(file, 800, 0.82);
      setCustomImageUrl(dataUrl);
    } catch (err: any) {
      alert(err?.message || 'Could not read image file. Please try another image.');
      setImageError(true);
    } finally {
      setIsProcessingImage(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleApplyImageUrl = () => {
    if (!imageInputUrl.trim()) return;
    setCustomImageUrl(imageInputUrl.trim());
    setImageInputUrl('');
    setShowUrlInput(false);
    setImageError(false);
  };

  const handleRemoveImage = () => {
    setCustomImageUrl('');
    setImageError(false);
  };

  const handleApplyYouTube = () => {
    if (!youtubeInput.trim()) {
      setYoutubeUrl('');
      setYoutubeError(false);
      return;
    }
    if (isValidYouTubeUrl(youtubeInput)) {
      setYoutubeUrl(youtubeInput.trim());
      setYoutubeError(false);
    } else {
      setYoutubeError(true);
    }
  };

  const handleRemoveYouTube = () => {
    setYoutubeUrl('');
    setYoutubeInput('');
    setYoutubeError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalImageUrl = customImageUrl;
    if (!finalImageUrl && imageInputUrl.trim()) {
      finalImageUrl = imageInputUrl.trim();
    }

    let finalYoutubeUrl = youtubeUrl;
    if (!finalYoutubeUrl && youtubeInput.trim() && isValidYouTubeUrl(youtubeInput.trim())) {
      finalYoutubeUrl = youtubeInput.trim();
    }

    const restDisplay =
      restSeconds >= 60
        ? restSeconds % 60 === 0
          ? `${restSeconds / 60} min`
          : `${Math.floor(restSeconds / 60)}m ${restSeconds % 60}s`
        : `${restSeconds} sec`;

    const updated: Exercise = {
      ...exercise,
      name: name.trim(),
      target: target.trim(),
      category,
      defaultSets: Number(sets) || 3,
      repRange: repRange.trim(),
      restSeconds: Number(restSeconds) || 90,
      restDisplay,
      notes: notes.trim(),
      clipartType,
      customImageUrl: finalImageUrl ? finalImageUrl : undefined,
      youtubeUrl: finalYoutubeUrl.trim() ? finalYoutubeUrl.trim() : undefined,
    };

    onSave(updated);
    onClose();
  };

  const isYoutubeValid = youtubeUrl ? isValidYouTubeUrl(youtubeUrl) : false;
  const youtubeEmbedUrl = isYoutubeValid ? getYouTubeEmbedUrl(youtubeUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-3 sm:px-4 overflow-y-auto modal-safe-overlay">
      <div className="my-auto flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Exercise</h2>
            <p className="text-xs text-slate-500">Update demonstration image, video, and prescription</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* 1. Image Management Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                Exercise Demonstration Image
              </span>
              {customImageUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[11px] font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Revert to stick-figure</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">Using default illustration</span>
              )}
            </div>

            {/* Live Preview & Action Boxes */}
            <div className="flex items-stretch gap-3 sm:gap-4">
              {/* Left: Small Image Window Preview */}
              <div className="relative h-[132px] w-32 sm:w-36 shrink-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs flex items-center justify-center">
                {customImageUrl ? (
                  <>
                    <img
                      src={customImageUrl}
                      alt="Preview"
                      className={`h-full w-full ${isGifUrl(customImageUrl) ? 'object-contain' : 'object-cover'}`}
                      onError={() => setImageError(true)}
                    />
                    {isGifUrl(customImageUrl) && (
                      <span className="absolute top-1.5 left-1.5 rounded-md bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 shadow-xs uppercase tracking-wider backdrop-blur-xs">
                        GIF
                      </span>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-1 text-slate-700">
                    <ExerciseClipart type={clipartType} size="md" className="border-0 bg-transparent text-slate-700" />
                  </div>
                )}
              </div>

              {/* Right: The 3 Boxes in a vertical list, same size, one below another */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                {/* Hidden File Input for Gallery */}
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="exercise-choose-gallery"
                />

                {/* Box 1: Upload from Gallery */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{isProcessingImage ? 'Processing...' : 'Upload from Gallery'}</span>
                </button>

                {/* Box 2: Add Image URL (Toggles dedicated full-width input below) */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl border transition-all shadow-2xs active:scale-[0.99] cursor-pointer ${
                    showUrlInput
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold'
                  } text-xs`}
                >
                  <Link className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Add Image URL</span>
                </button>

                {/* Box 3: Revert to Stick-Figure or Default indicator */}
                {customImageUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    <span className="truncate">Revert to Stick-Figure</span>
                  </button>
                ) : (
                  <div className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-2 text-[11px] text-slate-400 font-medium select-none">
                    <span>Default illustration active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dedicated Full-Width Image URL input row (No overlap, plenty of room) */}
            {showUrlInput && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2 transition-all">
                <div className="flex items-center justify-between text-[11px] font-semibold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Link className="h-3 w-3 text-blue-600" />
                    Paste Image or Animated GIF URL
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    placeholder="https://example.com/exercise-demo.gif"
                    value={imageInputUrl}
                    onChange={(e) => {
                      setImageInputUrl(e.target.value);
                      setImageError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyImageUrl();
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs min-w-0"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleApplyImageUrl}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-2xs shrink-0 cursor-pointer active:scale-95 transition-all"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Unable to load image from that source. Please check the URL.
              </p>
            )}
          </div>

          {/* 2. YouTube Demonstration Video Link */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Youtube className="h-3.5 w-3.5 text-red-600" />
                Optional YouTube Demonstration Video
              </span>
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={handleRemoveYouTube}
                  className="text-[11px] font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove video</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste YouTube link (e.g. youtube.com/watch?v=... or youtu.be/...)"
                value={youtubeInput}
                onChange={(e) => {
                  setYoutubeInput(e.target.value);
                  setYoutubeError(false);
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyYouTube}
                className="rounded-lg bg-slate-900 px-3.5 py-2 font-semibold text-white hover:bg-slate-800 text-xs shrink-0"
              >
                Set Link
              </button>
            </div>

            {youtubeError && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid YouTube link (watch, youtu.be, or shorts).
              </p>
            )}

            {/* Video preview if set */}
            {youtubeEmbedUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 mx-auto mt-2">
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </div>

          {/* 3. Exercise Details & Prescription */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Target Muscle(s) *
                </label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Body Group
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={sets}
                  onChange={(e) => setSets(parseInt(e.target.value, 10) || 3)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Rep Range
                </label>
                <input
                  type="text"
                  value={repRange}
                  onChange={(e) => setRepRange(e.target.value)}
                  placeholder="8–12"
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Rest Seconds
                </label>
                <input
                  type="number"
                  step="15"
                  min="0"
                  max="600"
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(parseInt(e.target.value, 10) || 90)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                Form Cues & Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key posture cues, breathing tempo, and tips..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${exercise.name}" from this workout routine?`)) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 font-semibold text-red-600 hover:bg-red-100 transition-colors text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Exercise</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-sm active:scale-95 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
