import { CommonFieldsEntity } from './common';

export type UserEntity = Pick<
  CommonFieldsEntity,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
};
