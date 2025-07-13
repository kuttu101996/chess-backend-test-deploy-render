import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGame extends Document {
  whitePlayer: Types.ObjectId;
  blackPlayer: Types.ObjectId;
  status: 'pending' | 'active' | 'completed' | 'declined';
  fen: string;
  turn: 'w' | 'b';
  winner?: Types.ObjectId | null;
}

const GameSchema: Schema = new Schema(
  {
    whitePlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blackPlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },
    fen: {
      type: String,
      default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Initial board position
    },
    turn: {
      type: String,
      enum: ['w', 'b'],
      default: 'w',
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGame>('Game', GameSchema);
