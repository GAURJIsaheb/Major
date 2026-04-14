import mongoose from "mongoose";

const BulletinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

BulletinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BulletinModel = mongoose.model("Bulletin", BulletinSchema);

export default BulletinModel;
