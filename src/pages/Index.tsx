import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Train, 
  QrCode, 
  Scan, 
  Shield, 
  Package, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QRScannerComponent from '@/components/QRScanner';
import { findPartByUniqueId } from '@/data/railwayData';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanResult = (qrData: string) => {
    console.log('Scanned QR data:', qrData);
    const trimmedQrData = qrData.trim();
    
    // Try to find the part by unique ID
    const part = findPartByUniqueId(trimmedQrData);
    
    if (part) {
      toast({
        title: "Part Found!",
        description: `${part.partName} - ${part.partNo}`,
      });
      // Use the exact scanned QR code value for navigation
      navigate(`/part/${encodeURIComponent(trimmedQrData)}`);
    } else {
      toast({
        title: "Part Not Found",
        description: "The QR code doesn't match any parts in our database.",
        variant: "destructive",
      });
    }
    
    setShowScanner(false);
  };

  const features = [
    {
      icon: Shield,
      title: "Warranty Tracking",
      description: "Real-time warranty status monitoring for all railway components"
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Complete parts database with detailed specifications and history"
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Quick QR code scanning for immediate part information retrieval"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Railway QR System
              </h1>
              <p className="text-slate-400">Intelligent Parts Management & Tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent mb-4">
            Scan. Track. Manage.
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Advanced QR code system for railway parts management with real-time warranty tracking and comprehensive inventory control.
          </p>
        </div>

        {/* Main CTA */}
        <div className="mb-16">
          <Card className="inline-block bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 shadow-2xl shadow-blue-600/10 hover-lift transition-all duration-500 animate-slide-up">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 animate-pulse">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
                  Scan QR Code
                </h3>
                <p className="text-slate-400 mb-6 max-w-sm">
                  Use your camera or upload an image to get instant part information
                </p>
                <Button
                  onClick={() => setShowScanner(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 text-lg px-8 py-6 h-auto transition-all duration-300 hover:shadow-blue-600/40 hover:-translate-y-1 group"
                >
                  <Scan className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Start Scanning
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 hover-lift group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 pt-16 border-t border-slate-700/50">
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Secure & Reliable
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Enterprise-grade security with encrypted data transmission and comprehensive audit trails for all part interactions.
              </p>
            </div>
            <div className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Lightning Fast
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Instant QR code recognition with real-time database synchronization for immediate access to critical part information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScannerComponent
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Index;