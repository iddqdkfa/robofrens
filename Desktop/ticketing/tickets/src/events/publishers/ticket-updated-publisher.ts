import {Publisher, Subjects, TicketUpdatedEvent} from '@iddqdkfatickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}