import { IsEmail, IsOptional, IsString, Length, IsUUID } from 'class-validator';

export class EditNotifiedRequestPersonDto {
  @IsUUID('4', { message: 'notificationId inválido.' })
  notificationId!: string;

  @IsOptional()
  @IsString({ message: 'O campo name deve ser uma string.' })
  @Length(5, 100, { message: 'O nome deve ter entre 5 e 100 caracteres.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'O campo phone deve ser uma string.' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'O campo cep deve ser uma string.' })
  @Length(8, 9, { message: 'O CEP deve ter 8 caracteres (com ou sem hífen).' })
  cep?: string;

  @IsOptional()
  @IsString({ message: 'O campo state deve ser uma string.' })
  @Length(2, 2, {
    message: 'O estado deve ter exatamente 2 caracteres (ex: CE).',
  })
  state?: string;

  @IsOptional()
  @IsString({ message: 'O campo city deve ser uma string.' })
  @Length(5, 100, { message: 'O campo deve ter entre 5 e 100 caracteres.' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'O campo neighborhood deve ser uma string.' })
  @Length(5, 100, { message: 'O campo deve ter entre 5 e 100 caracteres.' })
  neighborhood?: string;

  @IsOptional()
  @IsString({ message: 'O campo street deve ser uma string.' })
  @Length(5, 100, { message: 'O campo deve ter entre 5 e 100 caracteres.' })
  street?: string;
}
