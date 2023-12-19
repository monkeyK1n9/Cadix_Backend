import router from 'express';
import { 
    createMessage, 
    deleteMessage,
    getAllMessages,
    getMessage,
    updateMessage
} from '../middlewares/messages';
import { verify } from '../lib/verifyToken';


const messagesRouter = router.Router();

// CREATE MESSAGE
messagesRouter.post('/', verify, createMessage);

// DELETE MESSAGE
messagesRouter.delete('/:id', verify, deleteMessage);

// UPDATE MESSAGE
messagesRouter.put('/:id', verify, updateMessage);

// GET MESSAGES
messagesRouter.get('/', verify, getAllMessages);

// GET MESSAGE
messagesRouter.get('/:id', verify, getMessage);


export { messagesRouter };