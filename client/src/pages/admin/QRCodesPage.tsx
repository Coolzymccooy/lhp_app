import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

interface Form {
  label: string;
  path: string;
  desc: string;
}

const FORMS: Form[] = [
  { label: 'First-Time Guest', path: '/connect', desc: 'New here? Scan to say hello.' },
  { label: 'Prayer Request', path: '/prayer', desc: 'Scan to submit a prayer request.' },
  { label: 'E-Membership', path: '/membership', desc: 'Scan to register / join.' },
  { label: 'Contact Us', path: '/contact', desc: 'Scan to send us a message.' },
  { label: 'iCare / Volunteer', path: '/icare', desc: 'Scan to request support or volunteer.' },
];

export default function QRCodesPage() {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const handleDownload = (form: Form) => {
    const canvas = canvasRefs.current[form.path];
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `lighthouse-qr-${form.label.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const getQRUrl = (path: string): string => {
    return `${window.location.origin}${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Codes</h2>
        <p className="text-sm text-gray-600 mt-1">Printable codes — people scan to open a form and submit their details.</p>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Tip:</p>
        <p>Print these on flyers, the bulletin, or display screens. The First-Time Guest code is the one to feature for visitors.</p>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FORMS.map(form => {
          const qrUrl = getQRUrl(form.path);
          return (
            <div key={form.path} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
              {/* QR Code */}
              <div className="mb-4 p-4 bg-white border border-gray-100 rounded-lg">
                <QRCodeCanvas
                  ref={(el: HTMLCanvasElement | null) => {
                    if (el) {
                      canvasRefs.current[form.path] = el;
                    }
                  }}
                  value={qrUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              {/* Label */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{form.label}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">{form.desc}</p>

              {/* URL */}
              <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded break-all mb-4 block w-full">
                {qrUrl}
              </code>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(form)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm w-full justify-center"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
