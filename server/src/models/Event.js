import mongoose from 'mongoose';

const seatCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  bookedCount: { type: Number, default: 0, min: 0 }
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true }, // e.g., 'Music', 'Tech', 'Sports'
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seatCategories: {
      type: [seatCategorySchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'An event must have at least one seat category']
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
        
        if (ret.seatCategories) {
          ret.seatCategories = ret.seatCategories.map(sc => {
            sc.id = sc._id.toString();
            delete sc._id;
            return sc;
          });
        }
        return ret;
      },
    },
  }
);

export const Event = mongoose.model('Event', eventSchema);
