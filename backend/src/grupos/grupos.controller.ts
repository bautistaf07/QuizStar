import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard, UsuarioActual, UsuarioToken } from '../common/roles';
import { GruposService } from './grupos.service';

export class CrearGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El grado o semestre es obligatorio' })
  grado: string;
}

export class MatricularDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Selecciona al menos un estudiante' })
  @IsString({ each: true })
  estudianteIds: string[];
}

@Controller('grupos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GruposController {
  constructor(private readonly grupos: GruposService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.PROFESOR)
  crear(@Body() dto: CrearGrupoDto, @UsuarioActual() actor: UsuarioToken) {
    return this.grupos.crear(dto, actor);
  }

  @Get()
  listar(@UsuarioActual() actor: UsuarioToken) {
    return this.grupos.listar(actor);
  }

  @Post(':id/matriculas')
  @Roles(Rol.ADMIN, Rol.PROFESOR)
  matricular(
    @Param('id') id: string,
    @Body() dto: MatricularDto,
    @UsuarioActual() actor: UsuarioToken,
  ) {
    return this.grupos.matricular(id, dto.estudianteIds, actor);
  }

  @Get(':id/estudiantes')
  @Roles(Rol.ADMIN, Rol.PROFESOR)
  estudiantes(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.grupos.estudiantes(id, actor);
  }
}
