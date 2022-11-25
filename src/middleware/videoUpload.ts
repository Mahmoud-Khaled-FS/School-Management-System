import multer from 'multer';
import storageLessonConfig, { videoFileFilter } from '../utils/multer-config';

const videoStorage = multer.diskStorage(storageLessonConfig);

const upload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
}).single('video');

export default upload;
