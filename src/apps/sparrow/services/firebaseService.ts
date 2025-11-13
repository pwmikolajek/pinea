import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PDF, Comment } from '../types';

// PDF Service
export const pdfService = {
  // Upload a PDF file
  upload: async (file: File, title: string, userId: string, userName: string): Promise<PDF> => {
    try {
      // Upload using Vercel Blob client-side upload
      const timestamp = Date.now();
      const filename = `pdfs/${userId}/${timestamp}_${file.name}`;

      // Use the upload helper from @vercel/blob/client
      const { upload } = await import('@vercel/blob/client');

      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-pdf',
      });

      const url = blob.url;

      // Create PDF metadata in Firestore
      const pdfData = {
        title,
        filename: file.name,
        file_path: url,
        download_url: url,
        uploader_id: userId,
        uploader_name: userName,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'pdfs'), pdfData);

      return {
        id: parseInt(docRef.id.substring(0, 8), 36),
        title,
        filename: file.name,
        uploader_id: 0,
        uploader_name: userName,
        file_path: url,
        created_at: new Date().toISOString(),
        _docId: docRef.id,
        _downloadURL: url,
      } as PDF & { _docId: string; _downloadURL: string };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },

  // Get all PDFs
  getAll: async (): Promise<(PDF & { _docId: string; _downloadURL: string })[]> => {
    try {
      const q = query(collection(db, 'pdfs'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id.substring(0, 8), 36),
          title: data.title,
          filename: data.filename,
          uploader_id: 0,
          uploader_name: data.uploader_name,
          file_path: data.download_url,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          _docId: doc.id,
          _downloadURL: data.download_url,
        };
      });
    } catch (error) {
      console.error('Error getting PDFs:', error);
      throw error;
    }
  },

  // Get PDF by ID
  getById: async (docId: string): Promise<(PDF & { _docId: string; _downloadURL: string }) | null> => {
    try {
      const docRef = doc(db, 'pdfs', docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: parseInt(docId.substring(0, 8), 36),
        title: data.title,
        filename: data.filename,
        uploader_id: 0,
        uploader_name: data.uploader_name,
        file_path: data.download_url,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        _docId: docId,
        _downloadURL: data.download_url,
      };
    } catch (error) {
      console.error('Error getting PDF:', error);
      throw error;
    }
  },

  // Delete PDF
  delete: async (docId: string): Promise<void> => {
    try {
      // Get PDF document
      const docRef = doc(db, 'pdfs', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Delete file from Vercel Blob via API
        try {
          await fetch('/api/delete-pdf', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: data.download_url }),
          });
        } catch (blobError) {
          console.error('Error deleting from Blob:', blobError);
          // Continue with Firestore cleanup even if Blob deletion fails
        }

        // Delete all comments for this PDF
        const commentsQuery = query(collection(db, 'comments'), where('pdf_id', '==', docId));
        const commentsSnapshot = await getDocs(commentsQuery);
        const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Delete PDF document
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      throw error;
    }
  },
};

// Comment Service
export const commentService = {
  // Create a comment
  create: async (
    pdfDocId: string,
    content: string,
    pageNumber: number,
    xPosition: number,
    yPosition: number,
    userId: string,
    userName: string
  ): Promise<Comment> => {
    try {
      const commentData = {
        pdf_id: pdfDocId,
        user_id: userId,
        user_name: userName,
        content,
        page_number: pageNumber,
        x_position: xPosition,
        y_position: yPosition,
        resolved: false,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'comments'), commentData);

      return {
        id: parseInt(docRef.id.substring(0, 8), 36),
        pdf_id: 0,
        user_id: 0,
        user_name: userName,
        content,
        page_number: pageNumber,
        x_position: xPosition,
        y_position: yPosition,
        resolved: false,
        created_at: new Date().toISOString(),
        _docId: docRef.id,
      } as Comment & { _docId: string };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Get comments by PDF
  getByPdf: async (pdfDocId: string): Promise<(Comment & { _docId: string })[]> => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('pdf_id', '==', pdfDocId),
        orderBy('created_at', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id.substring(0, 8), 36),
          pdf_id: 0,
          user_id: 0,
          user_name: data.user_name,
          content: data.content,
          page_number: data.page_number,
          x_position: data.x_position,
          y_position: data.y_position,
          resolved: data.resolved || false,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          _docId: doc.id,
        };
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  // Update comment
  update: async (
    docId: string,
    updates: { content?: string; x_position?: number; y_position?: number }
  ): Promise<void> => {
    try {
      const docRef = doc(db, 'comments', docId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Toggle resolved status
  toggleResolved: async (docId: string): Promise<void> => {
    try {
      const docRef = doc(db, 'comments', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentResolved = docSnap.data().resolved || false;
        await updateDoc(docRef, { resolved: !currentResolved });
      }
    } catch (error) {
      console.error('Error toggling resolved:', error);
      throw error;
    }
  },

  // Delete comment
  delete: async (docId: string): Promise<void> => {
    try {
      const docRef = doc(db, 'comments', docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};
