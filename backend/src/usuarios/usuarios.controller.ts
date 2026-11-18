import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard, UsuarioActual, UsuarioToken } from '../common/roles';
import { UsuariosService } from './usuarios.service';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'Escribe un correo válido' })
  correo: string;

  @IsString()
  password: string;

  @IsIn(['PROFESOR', 'ESTUDIANTE'], { message: 'El rol debe ser PROFESOR o ESTUDIANTE' })
  rol: string;
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  // SWR-USR-006: un ESTUDIANTE recibe 403 porque no está en la lista de roles.
  @Post()
  @Roles(Rol.ADMIN)
  crear(@Body() dto: CrearUsuarioDto, @UsuarioActual() actor: UsuarioToken) {
    return this.usuarios.crear(dto, actor);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.PROFESOR)
  listar(@UsuarioActual() actor: UsuarioToken) {
    return this.usuarios.listar(actor);
  }

  @Patch(':id/desactivar')
  @Roles(Rol.ADMIN)
  desactivar(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.usuarios.desactivar(id, actor);
  }
}
