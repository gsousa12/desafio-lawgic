import { CommonFieldsEntity } from './common';

export type NotificationEntity = Pick<
  CommonFieldsEntity,
  'id' | 'createdAt' | 'updatedAt'
> & {
  authorId: string;
  reviewerId?: string | null;
  title: string;
  description: string;
  hearingDate: Date;
  status: string;
  canceledAt: Date | null;
};
