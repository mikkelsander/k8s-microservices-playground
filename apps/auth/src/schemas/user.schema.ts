import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument, Mongoose } from 'mongoose';
import * as crypto from 'crypto';

export type UserDocument = HydratedDocument<User>;
export type UserDocumentLean = LeanDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  salt: string;

  id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Set a virtual field "id", which is just a string representation of _id
 */
UserSchema.virtual('id').get(function () {
  return this._id.toString();
});

/**
 * Transforms the json output of the mongoose document in order to hide and modify specific data before sending to client
 */
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.salt;
  },
});
