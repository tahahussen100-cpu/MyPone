"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Folder, File as FileIcon } from 'lucide-react';

export default function StorageManagerPage() {
  const supabase = createClient();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bucketName = 'images'; // Target Supabase Storage Bucket

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucketName).list();
    if (error) {
      alert(`Error loading files: ${error.message} (Bucket "images" might not exist yet)`);
    } else if (data) {
      setFiles(data);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    // Support multiple uploads natively
    const uploadPromises = Array.from(e.target.files).map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(`public/${fileName}`, file, { cacheControl: '3600', upsert: false });
        
      if (error) throw error;
    });

    try {
      await Promise.all(uploadPromises);
      alert('Upload completed successfully');
      fetchFiles();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    const { error } = await supabase.storage.from(bucketName).remove([fileName]);
    if (error) alert(`Error deleting: ${error.message}`);
    else fetchFiles();
  };

  return (
    <div className="font-cairo max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-tajawal text-primary flex items-center gap-3">
            <Folder className="w-8 h-8" />
            Storage Manager
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your Supabase Storage "images" bucket directly.
          </p>
        </div>
        
        <div>
          <input 
            type="file" 
            id="file-upload" 
            multiple 
            className="hidden" 
            onChange={handleUpload} 
            accept="image/*"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button asChild className="gap-2 cursor-pointer" disabled={uploading}>
              <span>
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Files'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
          <span className="font-bold flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" /> bucket/images/public
          </span>
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-8 animate-pulse">Scanning bucket...</div>
          ) : files.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
              <FileIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>No files found in the 'images' bucket.</p>
              <p className="text-sm">Click "Upload Files" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                <div key={file.name} className="group relative border border-border rounded-lg overflow-hidden bg-secondary">
                  {/* Since images could be private or need a signed URL, we show an icon or a placeholder here */}
                  <div className="aspect-square flex flex-col items-center justify-center p-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-center break-all line-clamp-2">{file.name}</span>
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(file.name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
