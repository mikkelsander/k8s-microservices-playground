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
  validatePassword: Function;
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

/**
 * Presave hook
 * Generates a random salt and computes a hash value for the provided password before committing to the database
 */
UserSchema.pre<User>('save', async function () {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto
    .pbkdf2Sync(this.password, salt, 1000, 64, `sha512`)
    .toString(`hex`);

  this.password = hashedPassword;
  this.salt = salt;
});

/**
 * Compares the provided password with the hashed password in the database
 * @param providedPassword
 * @returns boolean
 */
UserSchema.methods.validatePassword = function (
  providedPassword: string,
): boolean {
  const hashedPassword = crypto
    .pbkdf2Sync(providedPassword, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return hashedPassword === this.password;
};
