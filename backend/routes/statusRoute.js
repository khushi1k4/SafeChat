const express = require('express');
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddleware');
const {multerMiddleware} = require('../config/cloudinaryConfig');

const router = express.Router();

// protected routes
router.post('/',authMiddleware,multerMiddleware,statusController.createStatus);
router.get('/',authMiddleware,statusController.getStatuses)

router.put('/:statusId/view',authMiddleware,statusController.viewStatus);
router.put('/:statusId',authMiddleware,statusController.deleteStatus);

module.exports = router; 