import { Request } from 'express';
import { UserDocument } from 'src/user/schemas/user.schema';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
