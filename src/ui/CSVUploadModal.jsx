import { X, Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { parseAppDate } from '../utils/dateTime';

export function CSVUploadModal({ isOpen, onClose, type, onUploadComplete, importEndpoint, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const productFields = [
    'name',
    'sku',
    'category',
    'stock',
    'costPrice',
    'sellingPrice',
    'expiryDate',
    'barcode',
    'description',
    'reorderLevel',
    'status',
  ];
  const supplierFields = [
    'supplierName',
    'contactPersonName',
    'email',
    'phoneNumberOne',
    'phoneNumberTwo',
    'street',
    'city',
    'country',
    'websiteURL',
    'tax_Id',
    'notes',
    'supplierStatus',
  ];

  const requiredFields = type === 'products'
    ? ['name', 'sku', 'category', 'stock', 'sellingPrice']
    : ['supplierName', 'contactPersonName', 'email', 'phoneNumberOne', 'phoneNumberTwo', 'street', 'city', 'country'];

  const formatFieldLabel = (field) =>
    field
      .replace(/_/g, ' ')
      .replace(/URL/g, 'Url')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/^./, char => char.toUpperCase());

  const fields = type === 'products' ? productFields : supplierFields;
  const templateHeaders = type === 'products'
    ? ['Name', 'SKU', 'Category Name', 'Quantity', 'Cost Price', 'Selling Price', 'Expiry Date', 'Barcode', 'Description', 'Reorder Level', 'Status']
    : ['Supplier Name', 'Contact Person', 'Email', 'Phone 1', 'Phone 2', 'Street', 'City', 'Country', 'Website', 'Tax ID', 'Notes', 'Status'];

  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const cleanHeader = (header) => header.replace(/^\uFEFF/, '').replace(/^"|"$/g, '').trim();
  const cleanNumberValue = (value) => String(value ?? '').replace(/[$€£,\s]/g, '');

  const parseNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(cleanNumberValue(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const parseInteger = (value, fallback = 0) => {
    const parsed = Number.parseInt(cleanNumberValue(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const escapeCsvValue = (value) => {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const getSupplierStatusCode = (status) => {
    const normalized = String(status || 'Active').trim().toLowerCase();
    return normalized === 'inactive' ? '0' : '1';
  };

  const buildProductImportFile = (rows) => {
    const backendHeaders = [
      'name',
      'sku',
      'category name',
      'quantity',
      'cost price',
      'selling price',
      'expiry date',
      'barcode',
      'description',
      'reorder level',
      'status',
    ];
    const csvRows = [
      backendHeaders.join(','),
      ...rows.map((row) => [
        row.name || '',
        row.sku || '',
        row.category || '',
        parseInteger(row.stock),
        parseNumber(row.costPrice),
        parseNumber(row.sellingPrice),
        row.expiryDate || '',
        row.barcode || '',
        row.description || '',
        parseInteger(row.reorderLevel),
        row.status || 'Active',
      ].map(escapeCsvValue).join(',')),
    ];

    return new File([csvRows.join('\n')], file?.name || 'products_template.csv', { type: 'text/csv' });
  };

  const buildSupplierImportFile = (rows) => {
    const backendFields = [
      ['supplier name', 'supplierName'],
      ['contact person name', 'contactPersonName'],
      ['email', 'email'],
      ['phone 1', 'phoneNumberOne'],
      ['phone 2', 'phoneNumberTwo'],
      ['street', 'street'],
      ['city', 'city'],
      ['country', 'country'],
      ['website url', 'websiteURL'],
      ['tax id', 'tax_Id'],
      ['notes', 'notes'],
      ['status', 'supplierStatus'],
    ];
    const csvRows = [
      backendFields.map(([header]) => header).join(','),
      ...rows.map((row) => backendFields.map(([, field]) => {
        if (field === 'supplierStatus') return getSupplierStatusCode(row[field]) === '0' ? 'Inactive' : 'Active';
        return row[field] || '';
      }).map(escapeCsvValue).join(',')),
    ];

    return new File([csvRows.join('\n')], file?.name || 'suppliers_template.csv', { type: 'text/csv' });
  };

  const getUniqueDetails = (details, summary = '') => {
    const normalizedSummary = summary.trim().toLowerCase();
    return [...new Set(details || [])].filter((detail) => (
      detail && detail.trim().toLowerCase() !== normalizedSummary
    ));
  };

  const buildImportFailureMessage = (error) => {
    const statusText = error.status && !error.details?.length ? ` Server status: ${error.status}.` : '';
    return `${error.message || `Failed to import ${type}.`}${statusText}`;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      setImportResult(null);
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

        const rawHeaders = parseCSVLine(lines[0]).map(cleanHeader);
        const headers = rawHeaders.map(h => h.trim());
        const headerAliases = {
          barcode: 'barcode',
          category: 'category',
          categoryname: 'category',
          city: 'city',
          contactperson: 'contactPersonName',
          contactpersonname: 'contactPersonName',
          costprice: 'costPrice',
          description: 'description',
          email: 'email',
          expirydate: 'expiryDate',
          leadtime: 'leadTime',
          name: 'name',
          notes: 'notes',
          ontimepercentage: 'onTimePercentage',
          'on-timepercentage': 'onTimePercentage',
          phonenumberone: 'phoneNumberOne',
          phone1: 'phoneNumberOne',
          phoneone: 'phoneNumberOne',
          primaryphone: 'phoneNumberOne',
          phonenumbertwo: 'phoneNumberTwo',
          phone2: 'phoneNumberTwo',
          phonetwo: 'phoneNumberTwo',
          secondaryphone: 'phoneNumberTwo',
          quantity: 'stock',
          stocklevel: 'stock',
          stock: 'stock',
          qualityscore: 'qualityScore',
          country: 'country',
          price: 'sellingPrice',
          reorderlevel: 'reorderLevel',
          sellingprice: 'sellingPrice',
          sku: 'sku',
          status: 'status',
          street: 'street',
          suppliername: 'supplierName',
          supplierstatus: 'supplierStatus',
          taxid: 'tax_Id',
          tax_id: 'tax_Id',
          unitprice: 'sellingPrice',
          website: 'websiteURL',
          websiteurl: 'websiteURL',
        };
        if (type === 'suppliers') {
          headerAliases.name = 'supplierName';
          headerAliases.status = 'supplierStatus';
        }
        const normalizedHeaders = headers.map(header => headerAliases[header.toLowerCase().replace(/\s+/g, '')] || header);

        const requiredCanonical = requiredFields.map(field => headerAliases[field.toLowerCase().replace(/\s+/g, '')] || field);
        const normalizedHeaderLower = normalizedHeaders.map(header => header.toLowerCase());
        const missingFields = requiredCanonical.filter(field => !normalizedHeaderLower.includes(field.toLowerCase()));
        if (missingFields.length > 0) {
          toast.error(`Missing required fields: ${missingFields.map(formatFieldLabel).join(', ')}`);
          setIsProcessing(false);
          return;
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]).map(v => v.trim());
          const row = {};
          const errors = [];

          normalizedHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          requiredCanonical.forEach(field => {
            if (!row[field]) {
              errors.push(`Missing ${formatFieldLabel(field).toLowerCase()}`);
            }
          });

          if (type === 'products') {
            ['stock', 'reorderLevel'].forEach(field => {
              if (row[field] && !Number.isFinite(Number.parseInt(cleanNumberValue(row[field]), 10))) {
                errors.push(`Invalid ${field === 'reorderLevel' ? 'reorder level' : field} format`);
              }
            });
            ['costPrice', 'sellingPrice'].forEach(field => {
              if (row[field] && !Number.isFinite(Number.parseFloat(cleanNumberValue(row[field])))) {
                errors.push(`Invalid ${field === 'costPrice' ? 'cost price' : 'selling price'} format`);
              }
            });
            const parsedExpiryDate = parseAppDate(row.expiryDate);
            if (row.expiryDate && !parsedExpiryDate) {
              errors.push('Invalid expiry date format');
            }
            if (parsedExpiryDate && parsedExpiryDate.getFullYear() < 2000) {
              errors.push('Expiry date looks too old. Use YYYY-MM-DD, for example 2099-12-31');
            }
            if (row.barcode && /^[+-]?\d+(\.\d+)?e[+-]?\d+$/i.test(row.barcode)) {
              errors.push('Barcode was converted to scientific notation. Format the barcode column as text and re-enter the full barcode');
            }
          } else {
            if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
              errors.push('Invalid email format');
            }
            ['phoneNumberOne', 'phoneNumberTwo'].forEach(field => {
              if (row[field] && !/^\d+$/.test(row[field])) {
                errors.push(`${formatFieldLabel(field)} must contain digits only`);
              }
            });
            if (row.supplierStatus && !['active', 'inactive'].includes(row.supplierStatus.toLowerCase())) {
              errors.push('Supplier status must be Active or Inactive');
            }
          }

          parsed.push({ data: row, errors, isValid: errors.length === 0, rowNumber: i + 1 });
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

  const handleUpload = async () => {
    const validEntries = parsedData.filter(p => p.isValid);
    const validData = validEntries.map(p => p.data);

    if (importEndpoint && file) {
      setIsUploading(true);
      setImportResult(null);
      try {
        const formData = new FormData();
        const uploadFile = type === 'products'
          ? buildProductImportFile(validData)
          : type === 'suppliers'
            ? buildSupplierImportFile(validData)
            : file;
        formData.append('file', uploadFile);
        const response = await apiRequest(importEndpoint, {
          method: 'POST',
          body: formData,
        });
        const responseMessage = typeof response === 'string'
          ? response
          : response?.message || response?.title;
        const noun = type === 'products' ? 'product' : 'supplier';
        const countText = `${validData.length} ${noun}${validData.length === 1 ? '' : 's'}`;
        setImportResult({
          tone: 'success',
          title: 'Import complete',
          message: responseMessage || `${countText} ${validData.length === 1 ? 'was' : 'were'} sent to Tanzeem.`,
        });
        toast.success(`Successfully imported ${countText}`);
        onImportSuccess?.();
      } catch (error) {
        const message = buildImportFailureMessage(error);
        const details = getUniqueDetails(error.details, message);
        setImportResult({
          tone: 'danger',
          title: 'Import failed',
          message,
          details,
        });
        toast.error(error.message || `Failed to import ${type}`);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    onUploadComplete?.(validData);
    toast.success(`Successfully imported ${validData.length} ${type}`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setShowPreview(false);
    setImportResult(null);
    setIsProcessing(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData([]);
    setShowPreview(false);
    setImportResult(null);
    setIsProcessing(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = templateHeaders.join(',');
    const exampleRow = type === 'products'
      ? 'Example Product,SKU-001,Electronics,100,12.50,29.99,2099-12-31,BAR-742315698024,Short product description,10,Active'
      : 'Example Supplier,Alex Morgan,supplier@example.com,12345678900,12345678901,123 Market Street,Cairo,Egypt,https://example.com,TAX-123,Preferred supplier,Active';

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

  const validRows = parsedData.filter(p => p.isValid).length;
  const invalidRows = parsedData.length - validRows;
  const invalidRowDetails = parsedData
    .map((row, index) => ({ itemNumber: index + 1, errors: row.errors }))
    .filter(row => row.errors.length > 0);
  const hasSuccessfulImport = importResult?.tone === 'success';
  const displayCsvValue = (field, value) => {
    if (type === 'suppliers' && field === 'onTimePercentage' && !value) return '--';
    return value || '-';
  };

  return (
    <div className="csv-modal-backdrop app-modal-layer fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="csv-modal app-card w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="app-card-header csv-modal-header">
          <div>
            <h2 className="app-card-title">
              Import {type === 'products' ? 'Products' : 'Suppliers'} from CSV
            </h2>
            <p className="app-page-subtitle">
              Upload a template-based CSV, review row issues, then send only valid rows.
            </p>
          </div>
          <button onClick={handleClose} className="db-icon-btn" aria-label="Close CSV import">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="csv-modal-body flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="csv-guidance-grid">
              <div className="csv-guidance-card">
                <div className="flex items-start gap-3">
                  <div className="app-action-icon bg-[var(--app-info-bg)]">
                    <Download className="w-5 h-5 text-[var(--app-info-text)]" />
                  </div>
                  <div className="flex-1">
                    <h3>Start with the template</h3>
                    <p>
                      Use the generated CSV so the column names match the import parser.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="app-link"
                    >
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Required Fields Info */}
              <div className="csv-guidance-card">
                <h3>Required fields</h3>
                <div className="csv-field-list">
                  {requiredFields.map(field => (
                    <span key={field} className="db-stat-pill pill-gray">
                      {formatFieldLabel(field)}
                    </span>
                  ))}
                </div>
                <p>
                  Optional fields: {fields.filter(f => !requiredFields.includes(f)).map(formatFieldLabel).join(', ')}
                </p>
              </div>
              </div>

              {/* Upload Area */}
              <div className="csv-dropzone">
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
                    <div className="csv-dropzone-icon">
                      <Upload className="w-8 h-8 text-[var(--app-green)]" />
                    </div>
                    <div>
                      <p className="csv-dropzone-title">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="csv-dropzone-copy">CSV files only. The preview appears before import.</p>
                    </div>
                  </div>
                </label>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="w-5 h-5 text-[var(--app-green)] animate-spin" />
                  <span className="csv-muted-text">Processing CSV file...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="csv-summary-grid">
                <div className="csv-summary-card is-valid">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Valid Rows</span>
                  </div>
                  <p>{validRows}</p>
                </div>
                <div className="csv-summary-card is-invalid">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Invalid Rows</span>
                  </div>
                  <p>{invalidRows}</p>
                </div>
              </div>

              {importResult && (
                <div className={`csv-result-panel is-${importResult.tone}`}>
                  {importResult.tone === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <div>
                    <h3>{importResult.title}</h3>
                    <p>{importResult.message}</p>
                    {importResult.details?.length > 0 && (
                      <ul className="csv-result-details">
                        {importResult.details.slice(0, 6).map((detail, index) => (
                          <li key={`${detail}-${index}`}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {invalidRowDetails.length > 0 && (
                <div className="csv-issue-panel">
                  <h3>Rows to fix</h3>
                  <ul>
                    {invalidRowDetails.slice(0, 6).map(row => (
                      <li key={row.itemNumber}>
                        <span>Item {row.itemNumber}</span>
                        {row.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                  {invalidRowDetails.length > 6 && (
                    <p>Showing 6 of {invalidRowDetails.length} invalid rows.</p>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <div className="app-card csv-preview-card">
                <div className="app-card-header">
                  <h3 className="app-card-title">Data Preview</h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="app-table csv-preview-table">
                    <thead className="sticky top-0">
                      <tr>
                        <th>Status</th>
                        {fields.map(field => (
                          <th key={field}>
                            {formatFieldLabel(field)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, index) => (
                        <tr key={index} className={!row.isValid ? 'csv-row-invalid' : ''}>
                          <td>
                            {row.isValid ? (
                              <CheckCircle2 className="csv-status-icon is-valid" />
                            ) : (
                              <div className="group relative">
                                <AlertCircle className="csv-status-icon is-invalid" />
                                <div className="csv-error-tooltip">
                                  {row.errors.join(', ')}
                                </div>
                              </div>
                            )}
                          </td>
                          {fields.map(field => (
                            <td key={field}>
                              {displayCsvValue(field, row.data[field])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="csv-preview-more">
                    Showing 10 of {parsedData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="csv-modal-footer flex items-center justify-between gap-3 p-6">
          <button
            onClick={handleClose}
            className="db-secondary-btn"
          >
            Cancel
          </button>
          {showPreview && (
            <div className="flex items-center gap-3">
              <button
                onClick={resetUpload}
                className="db-secondary-btn"
              >
                {hasSuccessfulImport ? 'Import another file' : 'Upload different file'}
              </button>
              <button
                onClick={hasSuccessfulImport ? handleClose : handleUpload}
                disabled={!hasSuccessfulImport && (validRows === 0 || isUploading)}
                className="db-primary-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasSuccessfulImport ? (
                  'Done'
                ) : isUploading ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${validRows} valid ${validRows === 1 ? 'row' : 'rows'}`
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
