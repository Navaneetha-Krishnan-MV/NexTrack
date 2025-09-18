import React, { useRef, useEffect, useState, useCallback } from 'react';
import {  Upload, X, Scan, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const mountedRef = useRef(true);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentCamera, setCurrentCamera] = useState<'environment' | 'user'>('environment');

  // Memoized scan handler to prevent re-renders
  const handleScanResult = useCallback((result: any) => {
    if (mountedRef.current) {
      console.log('QR Code detected:', result.data);
      onScan(result.data);
    }
  }, [onScan]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      } catch (err) {
        console.warn('Scanner cleanup error:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let timeoutId: NodeJS.Timeout;

    const initCamera = async () => {
      if (!mountedRef.current) return;
      
      setIsInitializing(true);
      setError('');
      
      try {
        // Add small delay to prevent rapid initialization
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 100);
        });

        if (!mountedRef.current) return;

        // Check camera availability
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          if (mountedRef.current) {
            setError('No camera found. Please use file upload option.');
            setHasCamera(false);
            setIsInitializing(false);
          }
          return;
        }

        if (mountedRef.current) {
          setHasCamera(true);
        }

        if (videoRef.current && mountedRef.current) {
          // Clean up any existing scanner
          cleanup();

          // Create new QR scanner with optimized settings
          const qrScanner = new QrScanner(
            videoRef.current,
            handleScanResult,
            {
              onDecodeError: () => {
                // Silent - no logging for decode errors to reduce console spam
              },
              highlightScanRegion: false, // Disable built-in highlighting for better performance
              highlightCodeOutline: false,
              preferredCamera: currentCamera,
              maxScansPerSecond: 2, // Reduced for better performance
              calculateScanRegion: (video) => {
                // Optimized scan region
                const size = Math.min(video.videoWidth, video.videoHeight) * 0.7;
                return {
                  x: (video.videoWidth - size) / 2,
                  y: (video.videoHeight - size) / 2,
                  width: size,
                  height: size,
                };
              }
            }
          );

          scannerRef.current = qrScanner;

          try {
            await qrScanner.start();
            if (mountedRef.current) {
              setIsScanning(true);
              setError('');
            }
          } catch (startError) {
            console.error('Camera start error:', startError);
            if (mountedRef.current) {
              // Try fallback camera
              const fallbackCamera = currentCamera === 'environment' ? 'user' : 'environment';
              try {
                await qrScanner.setCamera(fallbackCamera);
                await qrScanner.start();
                if (mountedRef.current) {
                  setCurrentCamera(fallbackCamera);
                  setIsScanning(true);
                  setError('');
                }
              } catch (fallbackError) {
                console.error('Fallback camera error:', fallbackError);
                if (mountedRef.current) {
                  setError('Camera access denied. Please allow camera permissions and try again.');
                  setHasCamera(false);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        if (mountedRef.current) {
          setError('Camera initialization failed. Please refresh and try again.');
          setHasCamera(false);
        }
      } finally {
        if (mountedRef.current) {
          setIsInitializing(false);
        }
      }
    };

    initCamera();

    return () => {
      mountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      cleanup();
    };
  }, [currentCamera, handleScanResult, cleanup]);

  const switchCamera = useCallback(async () => {
    if (!scannerRef.current || !hasCamera || isInitializing) return;
    
    try {
      const newCamera = currentCamera === 'environment' ? 'user' : 'environment';
      await scannerRef.current.setCamera(newCamera);
      setCurrentCamera(newCamera);
      setError('');
    } catch (err) {
      console.error('Camera switch error:', err);
      setError('Unable to switch camera. Try refreshing the page.');
    }
  }, [currentCamera, hasCamera, isInitializing]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const result = await QrScanner.scanImage(file);
      console.log('QR Code from file:', result);
      onScan(result);
    } catch (err) {
      console.error('File scan error:', err);
      setError('No QR code found. Ensure the image contains a clear, well-lit QR code.');
    }
  }, [onScan]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const retryCamera = useCallback(() => {
    setError('');
    setIsInitializing(true);
    setIsScanning(false);
    setCurrentCamera(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-600/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Scan className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Scan QR Code
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors duration-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span>{error}</span>
                {!hasCamera && (
                  <Button
                    onClick={retryCamera}
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-red-400 hover:text-red-300 p-0 h-auto font-normal underline"
                  >
                    Try again
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Camera Scanner */}
            {(hasCamera || isInitializing) && (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg bg-black border border-slate-700/50">
                  <video
                    ref={videoRef}
                    className="w-full h-80 object-cover"
                    playsInline
                    muted
                    autoPlay
                    style={{
                      transform: currentCamera === 'user' ? 'scaleX(-1)' : 'none',
                      willChange: 'auto' // Optimize for performance
                    }}
                  />
                  
                  {/* Loading Overlay */}
                  {isInitializing && (
                    <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-20">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-300 text-sm">Starting camera...</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {currentCamera === 'environment' ? 'Back camera' : 'Front camera'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scanning Overlay */}
                  {isScanning && !isInitializing && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Darkened overlay with cutout effect */}
                      <div className="absolute inset-0">
                        {/* Top overlay */}
                        <div className="absolute top-0 left-0 right-0 bg-black/60" style={{height: 'calc(50% - 112px)'}}></div>
                        {/* Bottom overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{height: 'calc(50% - 112px)'}}></div>
                        {/* Left overlay */}
                        <div className="absolute top-0 left-0 bottom-0 bg-black/60" style={{width: 'calc(50% - 112px)'}}></div>
                        {/* Right overlay */}
                        <div className="absolute top-0 right-0 bottom-0 bg-black/60" style={{width: 'calc(50% - 112px)'}}></div>
                      </div>

                      {/* Scan frame - positioned absolutely in center */}
                      <div 
                        className="absolute border-2 border-blue-400 rounded-lg"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: '224px',
                          height: '224px',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {/* Corner indicators */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-300 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-300 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-300 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-300 rounded-br-lg"></div>
                        
                        {/* Animated scan line */}
                        <div className="absolute inset-2 overflow-hidden rounded">
                          <div 
                            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"
                            style={{
                              animation: 'scanLine 2s ease-in-out infinite'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-slate-200 text-sm font-medium">Scanning...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera Controls */}
                  {hasCamera && isScanning && !isInitializing && (
                    <div className="absolute top-4 right-4 z-15">
                      <Button
                        onClick={switchCamera}
                        size="sm"
                        variant="ghost"
                        className="bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800/80 text-white border border-slate-700/50 rounded-full w-10 h-10 p-0"
                        title={`Switch to ${currentCamera === 'environment' ? 'front' : 'back'} camera`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {hasCamera && isScanning && !isInitializing && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">
                    <span className="text-emerald-400 text-sm font-medium">Camera ready</span>
                    <p className="text-emerald-400/80 text-xs">
                      {currentCamera === 'environment' ? 'Back camera' : 'Front camera'} active
                    </p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={triggerFileUpload}
                className="flex items-center gap-2 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:shadow-emerald-600/40 hover:-translate-y-0.5 group"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Upload Image
              </Button>
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Instructions */}
            <div className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4">
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                <span className="font-medium text-white">Position QR code</span> within the blue frame above, or upload an image with a QR code.
              </p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default QRScannerComponent;