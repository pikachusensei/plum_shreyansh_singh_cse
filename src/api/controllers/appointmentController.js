const aiService = require('../../services/aiService');
const fs = require('fs').promises;


exports.parseAppointmentRequest = async (req, res) => {
  try {
    const { text, user_timezone = 'Asia/Kolkata' } = req.body;//default Asia/Kolkata
    const imageFile = req.file;

    if (!text && !imageFile) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Request must contain either text or an image file.' 
      });
    }

    let result;

    if (imageFile) {
      console.log(`Processing image: ${imageFile.path}`);
      result = await aiService.processImageRequest(imageFile.path,user_timezone);
    } else {
      console.log(`Processing text: "${text}"`);
      result = await aiService.processTextRequest(text,user_timezone);
    }

    
    res.status(200).json(result);

  } catch (error) {
    
    console.error('Error in controller:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'An internal server error occurred.' 
    });
  } finally {
    
    if (req.file) {
      await fs.unlink(req.file.path);
      console.log(`Cleaned up file: ${req.file.path}`);
    }
  }
};