// File processing utility functions

import { CanvasSnapshot } from '@/types/canvas';

/**
 * Read file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
};

/**
 * Parse JSON snapshot file
 */
export const parseSnapshotFile = async (file: File): Promise<CanvasSnapshot> => {
  try {
    const text = await readFileAsText(file);
    const snapshot = JSON.parse(text) as CanvasSnapshot;

    // Basic format validation
    if (!snapshot.version || !snapshot.nodes || !snapshot.levels) {
      throw new Error('Invalid snapshot format: missing required fields');
    }

    // Version compatibility check
    if (snapshot.version !== '1.0') {
      console.warn(`Snapshot version ${snapshot.version} may not be fully compatible`);
    }
    
    return snapshot;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
};

/**
 * Validate file type
 */
export const validateSnapshotFile = (file: File): boolean => {
  // Check file extension
  if (!file.name.endsWith('.json')) {
    return false;
  }

  // Check MIME type
  if (file.type && !file.type.includes('json')) {
    return false;
  }

  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Download file
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Create snapshot filename
 */
export const createSnapshotFilename = (title?: string): string => {
  const timestamp = Date.now();
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (title) {
    // Clean special characters from title
    const cleanTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-]/g, '').trim();
    return `anyplan-${cleanTitle}-${dateStr}-${timestamp}.json`;
  }
  
  return `anyplan-snapshot-${dateStr}-${timestamp}.json`;
};

/**
 * Check if it's a snapshot file
 */
export const isSnapshotFile = (filename: string): boolean => {
  return filename.includes('anyplan') && 
         (filename.includes('snapshot') || filename.includes('graph')) && 
         filename.endsWith('.json');
};
