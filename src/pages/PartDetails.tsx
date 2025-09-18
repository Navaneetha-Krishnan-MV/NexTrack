import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Shield, 
  Building, 
  Hash, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award,
  FileText,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { findPartByUniqueId, getWarrantyStatus } from '@/data/railwayData';

const PartDetails = () => {
  const { uniqueId: encodedUniqueId } = useParams<{ uniqueId: string }>();
  const navigate = useNavigate();
  
  // Decode the URL-encoded uniqueId
  const uniqueId = encodedUniqueId ? decodeURIComponent(encodedUniqueId) : null;
  console.log('Decoded uniqueId:', uniqueId);
  
  const part = uniqueId ? findPartByUniqueId(uniqueId) : null;
  console.log('Found part:', part);
  
  if (!part) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 text-center shadow-2xl shadow-red-600/10 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/25">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Part Not Found
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            The requested part could not be found in our database. Please verify the QR code and try again.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-blue-600/40 hover:-translate-y-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scanner
          </Button>
        </Card>
      </div>
    );
  }

  const warrantyStatus = getWarrantyStatus(part.warrantyExpiry);
  
  const getStatusIcon = () => {
    switch (warrantyStatus.status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5" />;
      case 'expiring':
        return <Clock className="w-5 h-5" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getStatusColors = () => {
    switch (warrantyStatus.status) {
      case 'valid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20';
      case 'expiring':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-').map(Number);
    // Handle both 2-digit and 4-digit years
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month - 1, day);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseDate(dateStr);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Return original string if parsing fails
    }
  };

  const formatWarrantyExpiry = (expiry: string) => {
    try {
      const [month, year] = expiry.split('-').map(Number);
      const fullYear = 2000 + year; // Assuming 2-digit year in warranty
      const date = new Date(fullYear, month - 1, 1);
      
      if (isNaN(date.getTime())) throw new Error('Invalid warranty date');
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      console.error('Error formatting warranty date:', error);
      return `Expires: ${expiry}`; // Fallback to show raw value
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Part Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Info Card */}
        <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-600/10 mb-6 animate-slide-up">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                      {part.partName}
                    </h2>
                    <p className="text-slate-400 text-lg">Part No: <span className="text-slate-300 font-medium">{part.partNo}</span></p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50 px-3 py-1.5">
                    <Hash className="w-3 h-3 mr-1" />
                    ID: {part.uniqueId}
                  </Badge>
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30 px-3 py-1.5">
                    <Award className="w-3 h-3 mr-1" />
                    Railway Component
                  </Badge>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border shadow-lg ${getStatusColors()}`}>
                  {getStatusIcon()}
                  <span className="font-medium text-lg">{warrantyStatus.text}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-4 text-center hover-lift transition-all duration-300 animate-slide-up">
            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-slate-400 text-xs uppercase tracking-wide">Manufactured</p>
            <p className="text-white font-semibold">{formatDate(part.dateOfMfg).split(',')[1]?.trim()}</p>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-4 text-center hover-lift transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <Building className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-slate-400 text-xs uppercase tracking-wide">Vendor</p>
            <p className="text-white font-semibold">{part.vendorCode}</p>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-4 text-center hover-lift transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <Hash className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-400 text-xs uppercase tracking-wide">Lot No</p>
            <p className="text-white font-semibold">{part.lotNo}</p>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-4 text-center hover-lift transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-slate-400 text-xs uppercase tracking-wide">Warranty</p>
            <p className="text-white font-semibold">{formatWarrantyExpiry(part.warrantyExpiry).split(' ')[0]}</p>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manufacturing Details */}
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 animate-slide-up">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                Manufacturing Details
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Manufacturing Date</p>
                    <p className="text-white font-semibold text-lg">{formatDate(part.dateOfMfg)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Lot Number</p>
                    <p className="text-white font-semibold text-lg">{part.lotNo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Vendor Code</p>
                    <p className="text-white font-semibold text-lg">{part.vendorCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Warranty Information */}
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Warranty Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Warranty Expires</p>
                    <p className="text-white font-semibold text-lg">{formatWarrantyExpiry(part.warrantyExpiry)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    warrantyStatus.status === 'valid' ? 'bg-emerald-600/20' :
                    warrantyStatus.status === 'expiring' ? 'bg-amber-600/20' : 'bg-red-600/20'
                  }`}>
                    {getStatusIcon()}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Current Status</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-lg ${
                        warrantyStatus.status === 'valid' ? 'text-emerald-400' :
                        warrantyStatus.status === 'expiring' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {warrantyStatus.text}
                      </p>
                      {warrantyStatus.status === 'valid' && (
                        <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warranty Progress Bar */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-3">Warranty Timeline</p>
                  <div className="relative">
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          warrantyStatus.status === 'valid' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
                          warrantyStatus.status === 'expiring' ? 'bg-gradient-to-r from-amber-600 to-amber-500' : 
                          'bg-gradient-to-r from-red-600 to-red-500'
                        }`}
                        style={{ width: warrantyStatus.status === 'expired' ? '100%' : '60%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* History & Documentation */}
        <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 mt-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              History & Documentation
            </h3>
            <div className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Service History</p>
                  <p className="text-slate-300 leading-relaxed text-base">{part.history}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <Button 
            onClick={() => navigate('/')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-blue-600/40 hover:-translate-y-1 h-12 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Scan Another Part
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;