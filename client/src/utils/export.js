import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export room data to PDF
 */
export const exportToPDF = async (roomData, searches, topResults) => {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text(`Search Party Room: ${roomData.name}`, 20, yPosition);
    yPosition += 15;

    // Add room info
    pdf.setFontSize(12);
    pdf.text(`Created: ${new Date(roomData.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Total Searches: ${searches.length}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Participants: ${roomData.userCount}`, 20, yPosition);
    yPosition += 20;

    // Add top results section
    if (topResults && topResults.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Top Voted Results', 20, yPosition);
      yPosition += 15;

      topResults.forEach((result, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${result.title}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`URL: ${result.url}`, 25, yPosition);
        yPosition += 8;
        
        if (result.snippet) {
          const snippetLines = pdf.splitTextToSize(result.snippet, 170);
          pdf.text(snippetLines, 25, yPosition);
          yPosition += snippetLines.length * 5;
        }
        
        pdf.text(`Upvotes: ${result.upvotes} | Downvotes: ${result.downvotes}`, 25, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(0);
        yPosition += 5;
      });
    }

    // Add all searches section
    if (searches && searches.length > 0) {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text('All Searches', 20, yPosition);
      yPosition += 15;

      searches.forEach((search, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text(`${index + 1}. "${search.query}" by ${search.userNickname}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`${new Date(search.timestamp).toLocaleString()}`, 25, yPosition);
        yPosition += 8;
        
        if (search.results && search.results.length > 0) {
          pdf.text(`Results found: ${search.results.length}`, 25, yPosition);
          yPosition += 10;
        }
        
        pdf.setTextColor(0);
        yPosition += 5;
      });
    }

    return pdf;
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw new Error('Failed to create PDF export');
  }
};

/**
 * Export room data to Markdown
 */
export const exportToMarkdown = (roomData, searches, topResults) => {
  try {
    let markdown = `# Search Party Room: ${roomData.name}\n\n`;
    
    // Room information
    markdown += `**Created:** ${new Date(roomData.createdAt).toLocaleDateString()}\n`;
    markdown += `**Total Searches:** ${searches.length}\n`;
    markdown += `**Participants:** ${roomData.userCount}\n\n`;

    // Top results section
    if (topResults && topResults.length > 0) {
      markdown += `## Top Voted Results\n\n`;
      
      topResults.forEach((result, index) => {
        markdown += `### ${index + 1}. [${result.title}](${result.url})\n\n`;
        if (result.snippet) {
          markdown += `${result.snippet}\n\n`;
        }
        markdown += `**Votes:** +${result.upvotes} / -${result.downvotes} | **Search Query:** "${result.query}"\n\n`;
        markdown += '---\n\n';
      });
    }

    // All searches section
    if (searches && searches.length > 0) {
      markdown += `## All Searches\n\n`;
      
      searches.forEach((search, index) => {
        markdown += `### ${index + 1}. "${search.query}"\n\n`;
        markdown += `**By:** ${search.userNickname}\n`;
        markdown += `**When:** ${new Date(search.timestamp).toLocaleString()}\n\n`;
        
        if (search.results && search.results.length > 0) {
          markdown += `**Results Found:**\n\n`;
          search.results.forEach((result, resultIndex) => {
            markdown += `${resultIndex + 1}. [${result.title}](${result.url})\n`;
            if (result.snippet) {
              markdown += `   ${result.snippet}\n`;
            }
            markdown += '\n';
          });
        }
        
        if (search.clicks && search.clicks.length > 0) {
          markdown += `**Clicks:** ${search.clicks.length}\n`;
        }
        
        markdown += '\n---\n\n';
      });
    }

    // Footer
    markdown += `\n*Exported from Search Party on ${new Date().toLocaleString()}*\n`;

    return markdown;
  } catch (error) {
    console.error('Error creating Markdown:', error);
    throw new Error('Failed to create Markdown export');
  }
};

/**
 * Download file with given content
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Export room as image (screenshot)
 */
export const exportAsImage = async (elementId, filename = 'search-party-room') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Error exporting as image:', error);
    throw new Error('Failed to export as image');
  }
};
