import { IContentDocument } from '../models/content.model';
import { ISubscriptionDocument } from '../models/subscription.model';
import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      content?: IContentDocument;
      subscription?: ISubscriptionDocument;
    }
  }
}

export {};
