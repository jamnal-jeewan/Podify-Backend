import { compare, hash } from "bcrypt";
import { Model, model, ObjectId, Schema } from "mongoose";

type UserDocument = {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: { url: string; publicId: string };
  tokens: string[];
  favourites: ObjectId[];
  followers: ObjectId[];
  following: ObjectId[];
};

interface Methods {
  comparePassword(password: string): Promise<Boolean>;
}

const UserSchema = new Schema<UserDocument,{},Methods>({
  name: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Object,
    url: String,
    publicId: String,
  },
  tokens: {
    type: [String],
  },
  favourites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Audio"
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
  ],
},{timestamps:true});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  const result = await compare(password, this.password);
  return result;
};

export default model("User", UserSchema
) as Model<UserDocument, {}, Methods>;