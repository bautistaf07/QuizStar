import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard, UsuarioActual, UsuarioToken } from '../common/roles';

export class LoginDto {
  @IsEmail({}, { message: 'Escribe un correo válido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.correo, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@UsuarioActual() usuario: UsuarioToken) {
    return this.auth.perfil(usuario.sub);
  }
}
