import React, { useState } from 'react';
import { Download, FileText, Image, Loader } from 'lucide-react';
import { exportToPDF, exportToMarkdown, downloadFile, exportAsImage } from '../utils/export';

/**
 * Component for exporting room data in various formats
 */
const ExportPanel = ({ room, searches, topResults, users }) => {
  const [exporting, setExporting] = useState(null);

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      const pdf = await exportToPDF(room, searches, topResults);
      pdf.save(`search-party-${room?.name || 'room'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportMarkdown = () => {
    try {
      setExporting('markdown');
      const markdown = exportToMarkdown(room, searches, topResults);
      const filename = `search-party-${room?.name || 'room'}-${new Date().toISOString().split('T')[0]}.md`;
      downloadFile(markdown, filename, 'text/markdown');
    } catch (error) {
      console.error('Failed to export Markdown:', error);
      alert('Failed to export Markdown. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportImage = async () => {
    try {
      setExporting('image');
      // Note: This would need a specific element ID in the parent component
      await exportAsImage('room-content', `search-party-${room?.name || 'room'}`);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    try {
      setExporting('json');
      const data = {
        room,
        searches,
        topResults,
        users: users.map(user => ({
          id: user.id,
          nickname: user.nickname,
          joinedAt: user.joinedAt,
          isCreator: user.isCreator
        })),
        exportedAt: new Date().toISOString()
      };
      
      const json = JSON.stringify(data, null, 2);
      const filename = `search-party-${room?.name || 'room'}-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(json, filename, 'application/json');
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export JSON. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Export as PDF',
      description: 'Generate a formatted PDF report with all searches and top results',
      icon: FileText,
      action: handleExportPDF,
      disabled: !searches?.length
    },
    {
      id: 'markdown',
      title: 'Export as Markdown',
      description: 'Download a Markdown file that can be viewed in any text editor',
      icon: FileText,
      action: handleExportMarkdown,
      disabled: !searches?.length
    },
    {
      id: 'json',
      title: 'Export as JSON',
      description: 'Download raw data in JSON format for further processing',
      icon: Download,
      action: handleExportJSON,
      disabled: false
    },
    {
      id: 'image',
      title: 'Export as Image',
      description: 'Take a screenshot of the current room view',
      icon: Image,
      action: handleExportImage,
      disabled: true // Disabled for now as it needs specific implementation
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Export Room Data
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Save your collaborative search session in various formats
        </p>
      </div>

      {/* Room summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Room Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Room Name</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {room?.name || 'Untitled Room'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Created</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {room?.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Total Searches</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {searches?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Top Results</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {topResults?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="space-y-3">
        {exportOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.action}
            disabled={option.disabled || exporting === option.id}
            className={`w-full flex items-start space-x-4 p-4 rounded-lg border text-left transition-colors ${
              option.disabled
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {exporting === option.id ? (
                <Loader className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <option.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                {option.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {option.description}
              </p>
            </div>
            
            {exporting === option.id && (
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Exporting...
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Export Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• PDF format is best for sharing and presentations</li>
          <li>• Markdown format works great with documentation tools</li>
          <li>• JSON format allows for data analysis and processing</li>
          <li>• Export regularly to save your research progress</li>
        </ul>
      </div>

      {/* No data message */}
      {(!searches || searches.length === 0) && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No searches to export yet</p>
          <p className="text-sm">Start searching to generate exportable data</p>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
