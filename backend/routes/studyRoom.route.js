const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/', protect, roomController.getAllRooms);
router.get('/my-rooms', protect, roomController.getMyRooms);
router.get('/:id', protect, roomController.getRoomById);
router.post('/', protect, roomController.createRoom);
router.put('/:id', protect, roomController.updateRoom);
router.delete('/:id', protect, roomController.deleteRoom);
router.post('/join', protect, roomController.joinRoomByCode);
router.post('/:id/join', protect, roomController.joinRoom);
router.post('/:id/leave', protect, roomController.leaveRoom);
router.get('/:id/members', protect, roomController.getRoomMembers);
router.put('/:id/notes', protect, roomController.updateSharedNotes);
router.get('/:id/notes', protect, roomController.getSharedNotes);

module.exports = router;