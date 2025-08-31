import { CommonFieldsEntity } from './common';

export type NotifiedPersonEntity = Pick<
  CommonFieldsEntity,
  'id' | 'createdAt' | 'updatedAt'
> & {
  notificationId: string;
  name: string;
  email: string;
  phone: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};
