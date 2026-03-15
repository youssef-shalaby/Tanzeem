import { X, Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export function CSVUploadModal({ isOpen, onClose, type, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const productFields = ['name', 'sku', 'category', 'price', 'stockLevel', 'expiryDate'];
  const supplierFields = ['name', 'onTimePercentage', 'leadTime', 'qualityScore', 'badge', 'status'];

  const requiredFields = type === 'products'
    ? ['name', 'sku', 'category', 'price', 'stockLevel']
    : ['name', 'leadTime', 'status'];

  const fields = type === 'products' ? productFields : supplierFields;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          toast.error('CSV file must contain headers and at least one data row');
          setIsProcessing(false);
          return;
        }

        const rawHeaders = lines[0].split(',').map(h => h.trim());
        const headers = rawHeaders.map(h => h.toLowerCase());

        const requiredLower = requiredFields.map(f => f.toLowerCase());
        const missingFields = requiredLower.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          toast.error(`Missing required fields: ${missingFields.join(', ')}`);
          setIsProcessing(false);
          return;
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          const errors = [];

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          requiredLower.forEach(field => {
            if (!row[field]) {
              errors.push(`Missing ${field}`);
            }
          });

          if (type === 'products') {
            if (row.price && isNaN(parseFloat(row.price))) {
              errors.push('Invalid price format');
            }
            const stockField = row.stocklevel || row.stock || row.stockLevel;
            if (stockField && isNaN(parseInt(stockField))) {
              errors.push('Invalid stock level format');
            }
          } else {
            const onTimeField = row.ontimepercentage || row['on-time percentage'] || row.onTimePercentage;
            if (onTimeField && (isNaN(parseInt(onTimeField)) || parseInt(onTimeField) < 0 || parseInt(onTimeField) > 100)) {
              errors.push('On-time percentage must be 0-100');
            }
            const qualityField = row.qualityscore || row.qualityScore;
            if (qualityField && (isNaN(parseFloat(qualityField)) || parseFloat(qualityField) < 0 || parseFloat(qualityField) > 5)) {
              errors.push('Quality score must be 0-5');
            }
          }

          parsed.push({ data: row, errors, isValid: errors.length === 0 });
        }

        setParsedData(parsed);
        setShowPreview(true);
        setIsProcessing(false);

        const validCount = parsed.filter(p => p.isValid).length;
        const invalidCount = parsed.filter(p => !p.isValid).length;

        if (invalidCount > 0) {
          toast.warning(`Found ${validCount} valid and ${invalidCount} invalid rows`);
        } else {
          toast.success(`Successfully parsed ${validCount} rows`);
        }
      } catch (error) {
        console.error('CSV Parse Error:', error);
        toast.error('Failed to parse CSV file');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleUpload = () => {
    const validData = parsedData.filter(p => p.isValid).map(p => p.data);
    onUploadComplete(validData);
    toast.success(`Successfully imported ${validData.length} ${type}`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setShowPreview(false);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const headers = fields.join(',');
    const exampleRow = type === 'products'
      ? 'Example Product,SKU-001,Electronics,29.99,100,N/A'
      : 'Example Supplier,95,5-7 days,4.8,Top Performer,Active';

    const csv = `${headers}\n${exampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Import {type === 'products' ? 'Products' : 'Suppliers'} from CSV
            </h2>
            <p className="text-sm text-gray-600 mt-1">Upload a CSV file to bulk import data</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Download Template</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Download our CSV template to ensure your file has the correct format
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Required Fields Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Required Fields</h3>
                <div className="flex flex-wrap gap-2">
                  {requiredFields.map(field => (
                    <span key={field} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700">
                      {field}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Optional fields: {fields.filter(f => !requiredFields.includes(f)).join(', ')}
                </p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#15aaad] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-[#15aaad]/10 rounded-full">
                      <Upload className="w-8 h-8 text-[#15aaad]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">CSV files only</p>
                    </div>
                  </div>
                </label>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="w-5 h-5 text-[#15aaad] animate-spin" />
                  <span className="text-sm text-gray-600">Processing CSV file...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Valid Rows</span>
                  </div>
                  <p className="text-2xl font-semibold text-green-900">
                    {parsedData.filter(p => p.isValid).length}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Invalid Rows</span>
                  </div>
                  <p className="text-2xl font-semibold text-red-900">
                    {parsedData.filter(p => !p.isValid).length}
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Data Preview</h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        {fields.map(field => (
                          <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, index) => (
                        <tr key={index} className={`border-b border-gray-100 ${!row.isValid ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className="group relative">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <div className="absolute left-0 top-6 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 w-48">
                                  {row.errors.join(', ')}
                                </div>
                              </div>
                            )}
                          </td>
                          {fields.map(field => (
                            <td key={field} className="px-4 py-3 text-sm text-gray-900">
                              {row.data[field] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600 text-center">
                    Showing 10 of {parsedData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {showPreview && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setFile(null);
                  setParsedData([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Upload Different File
              </button>
              <button
                onClick={handleUpload}
                disabled={parsedData.filter(p => p.isValid).length === 0}
                className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {parsedData.filter(p => p.isValid).length} Valid Rows
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
