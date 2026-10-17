import React, { useState } from 'react';
import { getYouTubeEmbedUrl, isValidYouTubeUrl } from '../utils/youtube';
import { Play, ChevronUp, ChevronDown, ExternalLink, AlertCircle, Youtube, Edit2, Trash2 } from 'lucide-react';

interface ExerciseVideoPlayerProps {
  youtubeUrl?: string;
  exerciseName: string;
  defaultExpanded?: boolean;
  onEditLink?: () => void;
  onRemoveLink?: () => void;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({
  youtubeUrl,
  exerciseName,
  defaultExpanded = false,
  onEditLink,
  onRemoveLink,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasLoadError, setHasLoadError] = useState(false);

  if (!youtubeUrl || youtubeUrl.trim() === '') {
    return null;
  }

  const isValid = isValidYouTubeUrl(youtubeUrl);
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  if (!isValid || !embedUrl) {
    return (
      <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] text-amber-800">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Invalid YouTube link.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onEditLink && (
            <button
              type="button"
              onClick={onEditLink}
              className="text-amber-900 font-semibold hover:underline text-[11px]"
            >
              Fix Link
            </button>
          )}
          {onRemoveLink && (
            <button
              type="button"
              onClick={onRemoveLink}
              className="text-red-600 hover:text-red-700 text-[11px]"
              title="Remove video link"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white transition-all shadow-2xs">
      {/* Compact toggle header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-600 text-white shrink-0">
            <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 truncate">
            {isExpanded ? 'Hide Video Demonstration' : 'Watch Form Demonstration Video'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Play Video'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expandable embedded player */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-950 p-2 sm:p-2.5">
          {hasLoadError ? (
            <div className="py-6 text-center text-xs text-slate-300 space-y-2">
              <p>Unable to embed this YouTube video directly (video may have embed restrictions).</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-500 text-xs"
                >
                  <Youtube className="h-3.5 w-3.5" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                {onEditLink && (
                  <button
                    type="button"
                    onClick={onEditLink}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Change Link</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner">
                <iframe
                  src={embedUrl}
                  title={`${exerciseName} demonstration`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setHasLoadError(true)}
                />
              </div>

              {/* Video control bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Youtube className="h-3 w-3 text-red-500" />
                  <span>Open in YouTube</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>

                <div className="flex items-center gap-2">
                  {onEditLink && (
                    <button
                      type="button"
                      onClick={onEditLink}
                      className="hover:text-slate-200 transition-colors"
                    >
                      Edit link
                    </button>
                  )}
                  {onRemoveLink && (
                    <button
                      type="button"
                      onClick={onRemoveLink}
                      className="hover:text-red-400 text-slate-400 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

