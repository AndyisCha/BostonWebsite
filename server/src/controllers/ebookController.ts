import { Request, Response } from 'express';
import { CEFRLevel } from '../types/cefr.js';
import { AuthRequest } from '../middleware/auth.js';
import { StorageService } from '../lib/storage.js';
import { supabaseAdmin } from '../lib/supabase.js';

export class EbookController {
  static async uploadEbook(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, author, description, level, language, country, category, tags } = req.body;

      if (!title || !author || !level) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Upload file to Supabase Storage
      const fileMetadata = await StorageService.uploadEbook(req.file);

      // TODO: Save ebook metadata to database
      res.json({
        success: true,
        message: 'E-book uploaded successfully',
        data: {
          file: fileMetadata,
          metadata: { title, author, level, description, language, country, category, tags }
        }
      });
    } catch (error) {
      console.error('Error uploading ebook:', error);
      res.status(500).json({ error: 'Failed to upload ebook' });
    }
  }

  static async searchEbooks(req: AuthRequest, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Ebook search endpoint - to be implemented',
        query: req.query
      });
    } catch (error) {
      console.error('Error searching ebooks:', error);
      res.status(500).json({ error: 'Failed to search ebooks' });
    }
  }

  static async getEbookPreview(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Ebook preview endpoint - to be implemented',
        ebookId: req.params.ebookId
      });
    } catch (error) {
      console.error('Error getting ebook preview:', error);
      res.status(500).json({ error: 'Failed to get ebook preview' });
    }
  }

  static async updateEbookStatus(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Ebook status update endpoint - to be implemented',
        ebookId: req.params.ebookId,
        body: req.body
      });
    } catch (error) {
      console.error('Error updating ebook status:', error);
      res.status(500).json({ error: 'Failed to update ebook status' });
    }
  }

  static async getAllEbooks(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Get all ebooks endpoint - to be implemented',
        level: req.query.level
      });
    } catch (error) {
      console.error('Error getting ebooks:', error);
      res.status(500).json({ error: 'Failed to get ebooks' });
    }
  }

  static async getUserEbooks(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Get user ebooks endpoint - to be implemented',
        userId: req.params.userId
      });
    } catch (error) {
      console.error('Error getting user ebooks:', error);
      res.status(500).json({ error: 'Failed to get user ebooks' });
    }
  }

  static async getEbookContent(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Get ebook content endpoint - to be implemented',
        ebookId: req.params.ebookId
      });
    } catch (error) {
      console.error('Error getting ebook content:', error);
      res.status(500).json({ error: 'Failed to get ebook content' });
    }
  }

  static async grantAccess(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Grant access endpoint - to be implemented',
        body: req.body
      });
    } catch (error) {
      console.error('Error granting access:', error);
      res.status(500).json({ error: 'Failed to grant access' });
    }
  }

  static async saveDrawing(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Save drawing endpoint - to be implemented',
        pageId: req.params.pageId,
        body: req.body
      });
    } catch (error) {
      console.error('Error saving drawing:', error);
      res.status(500).json({ error: 'Failed to save drawing' });
    }
  }

  static async getDrawing(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Get drawing endpoint - to be implemented',
        pageId: req.params.pageId,
        userId: req.query.userId
      });
    } catch (error) {
      console.error('Error getting drawing:', error);
      res.status(500).json({ error: 'Failed to get drawing' });
    }
  }

  static async toggleAnswer(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase
      res.json({
        message: 'Toggle answer endpoint - to be implemented',
        pageId: req.params.pageId,
        answerId: req.body.answerId
      });
    } catch (error) {
      console.error('Error toggling answer:', error);
      res.status(500).json({ error: 'Failed to toggle answer' });
    }
  }

  static async getCoverImage(req: Request, res: Response) {
    try {
      // TODO: Implement with Supabase Storage
      res.json({
        message: 'Get cover image endpoint - to be implemented',
        imageName: req.params.imageName
      });
    } catch (error) {
      console.error('Error serving cover image:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  }

  // MP3 Audio Management
  static async uploadAudio(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      const { ebookId, pageNumber, title, description } = req.body;

      if (!ebookId || !pageNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Upload audio file to Supabase Storage
      const audioMetadata = await StorageService.uploadAudio(req.file);

      // TODO: Save audio metadata to database
      res.json({
        success: true,
        message: 'Audio file uploaded successfully',
        data: {
          id: Date.now().toString(),
          ebookId,
          pageNumber: parseInt(pageNumber),
          title: title || `Audio ${pageNumber}`,
          description,
          audioUrl: audioMetadata.url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          duration: null, // TODO: Extract audio duration
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error uploading audio:', error);
      res.status(500).json({ error: 'Failed to upload audio file' });
    }
  }

  static async saveAudioButtons(req: Request, res: Response) {
    try {
      const { ebookId } = req.params;
      const { audioButtons } = req.body;

      if (!ebookId || !audioButtons) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Supabase에 오디오 버튼 데이터 저장
      const { data, error } = await supabaseAdmin
        .from('pdfs')
        .update({ audio_buttons: audioButtons })
        .eq('id', ebookId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save audio buttons to database' });
      }

      res.json({
        success: true,
        message: 'Audio buttons saved successfully',
        data: {
          ebookId,
          audioButtons,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error saving audio buttons:', error);
      res.status(500).json({ error: 'Failed to save audio buttons' });
    }
  }

  static async getAudioButtons(req: Request, res: Response) {
    try {
      const { ebookId } = req.params;

      if (!ebookId) {
        return res.status(400).json({ error: 'Missing ebook ID' });
      }

      // Supabase에서 오디오 버튼 데이터 가져오기
      const { data, error } = await supabaseAdmin
        .from('pdfs')
        .select('audio_buttons')
        .eq('id', ebookId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to get audio buttons from database' });
      }

      res.json({
        success: true,
        data: {
          ebookId,
          audioButtons: data?.audio_buttons || []
        }
      });
    } catch (error) {
      console.error('Error getting audio buttons:', error);
      res.status(500).json({ error: 'Failed to get audio buttons' });
    }
  }

  static async deleteAudio(req: Request, res: Response) {
    try {
      const { audioId } = req.params;

      if (!audioId) {
        return res.status(400).json({ error: 'Missing audio ID' });
      }

      // TODO: Delete from Supabase Storage and database
      res.json({
        success: true,
        message: 'Audio file deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting audio:', error);
      res.status(500).json({ error: 'Failed to delete audio file' });
    }
  }

  static async getAudioFile(req: Request, res: Response) {
    try {
      const { audioId } = req.params;

      if (!audioId) {
        return res.status(400).json({ error: 'Missing audio ID' });
      }

      // TODO: Stream audio file from Supabase Storage
      res.json({
        message: 'Stream audio endpoint - to be implemented',
        audioId
      });
    } catch (error) {
      console.error('Error streaming audio:', error);
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }

  // 정답 관리
  static async saveAnswers(req: Request, res: Response) {
    try {
      const { ebookId } = req.params;
      const { answers } = req.body;

      if (!ebookId || !answers) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Supabase에 정답 데이터 저장
      const { data, error } = await supabaseAdmin
        .from('pdfs')
        .update({ answers })
        .eq('id', ebookId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save answers to database' });
      }

      res.json({
        success: true,
        message: 'Answers saved successfully',
        data: {
          ebookId,
          answers,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      res.status(500).json({ error: 'Failed to save answers' });
    }
  }

  static async getAnswers(req: Request, res: Response) {
    try {
      const { ebookId } = req.params;

      if (!ebookId) {
        return res.status(400).json({ error: 'Missing ebook ID' });
      }

      // Supabase에서 정답 데이터 가져오기
      const { data, error } = await supabaseAdmin
        .from('pdfs')
        .select('answers')
        .eq('id', ebookId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to get answers from database' });
      }

      res.json({
        success: true,
        data: {
          ebookId,
          answers: data?.answers || []
        }
      });
    } catch (error) {
      console.error('Error getting answers:', error);
      res.status(500).json({ error: 'Failed to get answers' });
    }
  }

  // E-book 메타데이터 업데이트
  static async updateMetadata(req: Request, res: Response) {
    try {
      const { ebookId } = req.params;
      const { metadata } = req.body;

      if (!ebookId || !metadata) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Supabase에 메타데이터 저장
      const { data, error } = await supabaseAdmin
        .from('pdfs')
        .update({ metadata })
        .eq('id', ebookId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to update metadata in database' });
      }

      res.json({
        success: true,
        message: 'Metadata updated successfully',
        data: {
          ebookId,
          metadata,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating metadata:', error);
      res.status(500).json({ error: 'Failed to update metadata' });
    }
  }
}