const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'public/files' });

router.route('/upload').post(upload.single('file'), async (req, res) => {
  const { filename, originalname } = req.file;
  return res.status(200).json({ filename, originalname });
});

module.exports = router;
