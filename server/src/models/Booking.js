import mongoose from 'mongoose';

const bookingTicketSchema = new mongoose.Schema({
  seatCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  categoryName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    tickets: {
      type: [bookingTicketSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'A booking must have at least one ticket']
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['active', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        
        if (ret.tickets) {
          ret.tickets = ret.tickets.map(t => {
            t.id = t._id.toString();
            delete t._id;
            return t;
          });
        }
        return ret;
      },
    },
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
