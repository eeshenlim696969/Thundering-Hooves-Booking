import React, { useState, useEffect } from 'react';
import { generateConcertPoster } from '../services/gemini';
import { AspectRatio, ImageSize } from '../types';
import { Loader2, Image as ImageIcon, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

const ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];
const IMAGE_SIZES: ImageSize[] = ["1K", "2K", "4K"];

export const PosterGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('A grand Chinese New Year concert poster for Vitrox College, cinematic lighting, red lanterns, golden decorations, elegant stage, 8k resolution, festive atmosphere.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.hasSelectedApiKey) {
      const selected = await aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      setHasKey(!!process.env.API_KEY);
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const imageUrl = await generateConcertPoster(prompt, aspectRatio, imageSize);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found') || err.toString().includes('404')) {
         setError("Project not found or Billing not enabled. Please re-select a paid project API key.");
         setHasKey(false);
      } else {
        setError(err.message || "Failed to generate image.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
     return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-6 shadow-sm">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-amber-600" />
           </div>
           <div className="max-w-md">
             <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Connect Google Cloud Project</h3>
             <p className="text-stone-500 text-sm leading-relaxed">
               To generate high-quality posters (1K-4K) using Gemini 3 Pro, you must connect a <strong>paid</strong> Google Cloud Project with billing enabled.
             </p>
           </div>
           
           <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={handleSelectKey}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1 transition-colors"
              >
                Learn about Billing <ExternalLink className="w-3 h-3" />
              </a>
           </div>

           <div className="pt-6 border-t border-stone-100 w-full text-left">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Setup Requirements:</h4>
              <ul className="space-y-2 text-xs text-stone-500 list-disc list-inside">
                <li>Create a project in <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600">GCP Console</a></li>
                <li>Enable the <strong>Generative AI API</strong></li>
                <li>Link a <strong>Billing Account</strong> (Credit Card/Bank)</li>
                <li>Select that project in the dialog above</li>
              </ul>
           </div>
        </div>
     )
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
      <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <ImageIcon className="w-6 h-6 text-red-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Poster Studio</h2>
            <p className="text-xs text-stone-400">Powered by Gemini 3 Pro Image</p>
          </div>
        </div>
        <button onClick={() => setHasKey(false)} className="text-[10px] font-bold text-stone-400 hover:text-red-600 uppercase tracking-tighter transition-colors">Switch Project</button>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Creative Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-h-[140px] text-sm leading-relaxed"
              placeholder="A magical concert night with..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-sm font-medium"
              >
                {ASPECT_RATIOS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Resolution</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-sm font-medium"
              >
                {IMAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImageIcon className="w-5 h-5" /> Generate Poster</>}
          </button>
          {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        </div>
        <div className="lg:col-span-3">
          <div className={`w-full aspect-[${aspectRatio.replace(':', '/')}] bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden shadow-inner`}>
            {generatedImage ? <img src={generatedImage} alt="Generated Poster" className="w-full h-full object-contain" /> : <div className="text-center space-y-2"><ImageIcon className="w-12 h-12 text-stone-200 mx-auto" /><p className="text-stone-400 text-xs font-medium">Poster will appear here</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};