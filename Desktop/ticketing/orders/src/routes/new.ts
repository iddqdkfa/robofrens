import express, {Request, Response} from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@iddqdkfatickets/common';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {Ticket} from '../models/ticket';
import {Order} from '../models/order';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15*60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided')

], validateRequest, async (req: Request, res: Response) => {
const {ticketId } = req.body;

const ticket = await Ticket.findById(ticketId);
if(!ticket) {
    throw new NotFoundError();
}

const existingOrder = await Order.findOne({
    ticket: ticket,
    status: {
        $in: [
            OrderStatus.Created,
            OrderStatus.AwaitingPayment,
            OrderStatus.Complete
        ]
    }
})

const isReserved = await ticket.isReserved();

if(isReserved){
    throw new BadRequestError("Ticket is already reserved");

}

const expiration = new Date();

//Expiration window is seconds
expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
});

await order.save();

res.status(201).send(order);

})

export { router as newOrderRouter};