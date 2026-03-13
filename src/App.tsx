import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Image as ImageIcon, WandSparkles } from 'lucide-react';
import { pipeline } from '@xenova/transformers';

let removerPromise: Promise<any> | null = null;
async function getRemover() {
  if (!removerPromise) {
    removerPromise = pipeline('image-segmentation', 'Xenova/modnet');
  }
  return removerPromise;
}

export default function App() {
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const removeBg = async (file: File) => {
    setProcessing(true);
    setError('');
    setResultUrl('');

    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);

    try {
      const remover = await getRemover();
      const out: any = await remover(objectUrl);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = imageData.data;

      // Try to read mask from model output
      let maskData: Uint8ClampedArray | null = null;
      if (out?.mask?.data) {
        maskData = out.mask.data instanceof Uint8ClampedArray
          ? out.mask.data
          : new Uint8ClampedArray(out.mask.data);
      } else if (Array.isArray(out) && out[0]?.mask?.data) {
        const m = out[0].mask.data;
        maskData = m instanceof Uint8ClampedArray ? m : new Uint8ClampedArray(m);
      }

      if (!maskData) {
        throw new Error('Segmentation mask not found (model output format changed).');
      }

      // Resize mask to image size if needed (simple nearest-neighbor mapping)
      const maskW = (out && !Array.isArray(out) && out.mask?.width) ? out.mask.width : canvas.width;
      const maskH = (out && !Array.isArray(out) && out.mask?.height) ? out.mask.height : canvas.height;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const ix = (y * canvas.width + x) * 4;
          const mx = Math.floor((x / canvas.width) * maskW);
          const my = Math.floor((y / canvas.height) * maskH);
          const mi = my * maskW + mx;
          const alpha = maskData[mi] ?? 255;
          px[ix + 3] = alpha; // set alpha from mask
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
    } catch (e: any) {
      setError(e?.message || 'Background removal failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.22),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,.18),transparent_30%)]">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-medium">Background Remover MVP (Free Client-side)</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-2">Remove Backgrounds in Seconds</h1>
          <p className="text-textSecondary mt-4 max-w-2xl">
            Upload image → AI remove (in browser) → preview → download transparent PNG.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Upload</h2>
            <label className="block border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-primary/70 transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFileName(f.name);
                  removeBg(f);
                }}
              />
              <p className="font-medium">Drag & drop or click to upload</p>
              <p className="text-sm text-textSecondary mt-1">PNG, JPG, WEBP</p>
            </label>
            {fileName && <p className="mt-3 text-sm text-textSecondary">Selected: {fileName}</p>}
            {processing && (
              <p className="mt-4 text-secondary flex items-center gap-2"><WandSparkles className="w-4 h-4" /> AI is removing background...</p>
            )}
            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            {!error && resultUrl && <p className="mt-4 text-emerald-400">✅ Done. Preview updated.</p>}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-secondary" /> Preview</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-xl p-3">
                <p className="text-xs text-textSecondary mb-2">Original</p>
                <div className="h-44 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                  {originalUrl ? <img src={originalUrl} alt="original" className="max-h-full max-w-full" /> : null}
                </div>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <p className="text-xs text-textSecondary mb-2">Result</p>
                <div className="h-44 rounded-lg bg-[linear-gradient(45deg,#fff1_25%,transparent_25%,transparent_50%,#fff1_50%,#fff1_75%,transparent_75%,transparent)] bg-[length:20px_20px] overflow-hidden flex items-center justify-center">
                  {resultUrl ? <img src={resultUrl} alt="result" className="max-h-full max-w-full" /> : null}
                </div>
              </div>
            </div>
            <a
              href={resultUrl || '#'}
              download="removed-bg.png"
              className={`mt-4 w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${resultUrl ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-95' : 'bg-white/10 pointer-events-none text-textSecondary'}`}
            >
              <Download className="w-4 h-4" /> Download PNG
            </a>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4 text-sm">
          {['No signup required', 'In-browser processing option', 'Mobile responsive'].map((t) => (
            <div key={t} className="glass rounded-xl p-4 text-textSecondary">{t}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
