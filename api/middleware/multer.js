import multer from 'multer';

const storage = multer.memoryStorage();

// Accept only images (JPEG/PNG) and PDFs, max 5MB
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const isMimeType = filetypes.test(file.mimetype);
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isExtension = filetypes.test(ext);
    if (isMimeType && isExtension) return cb(null, true);
    cb(new Error('Unsupported file type. JPEG, PNG, or PDF only.'));
  },
});

export default upload;
