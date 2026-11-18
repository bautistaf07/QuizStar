import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard, UsuarioActual, UsuarioToken } from '../common/roles';
import { QuicesService } from './quices.service';

export class PreguntaDto {
  @IsString()
  @IsNotEmpty({ message: 'Cada pregunta necesita un enunciado' })
  enunciado: string;

  @IsArray()
  @ArrayMinSize(4, { message: 'Cada pregunta debe tener 4 opciones' })
  @ArrayMaxSize(4, { message: 'Cada pregunta debe tener 4 opciones' })
  @IsString({ each: true })
  opciones: string[];

  @IsInt()
  @Min(0)
  @Max(3, { message: 'La opción correcta debe estar entre 0 y 3' })
  opcionCorrecta: number;
}

export class CrearQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El tema es obligatorio' })
  tema: string;

  @IsInt()
  @Min(1, { message: 'El tiempo límite debe ser de al menos 1 minuto' })
  @Max(180, { message: 'El tiempo límite no puede pasar de 180 minutos' })
  tiempoLimiteMin: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'El quiz debe tener al menos una pregunta' })
  @ValidateNested({ each: true })
  @Type(() => PreguntaDto)
  preguntas: PreguntaDto[];
}

export class AsignarQuizDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Selecciona al menos un grupo' })
  @IsString({ each: true })
  grupoIds: string[];
}

export class ResponderDto {
  @IsString()
  @IsNotEmpty()
  preguntaId: string;

  @IsInt()
  @Min(0)
  @Max(3)
  opcion: number;
}

@Controller('quices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuicesController {
  constructor(private readonly quices: QuicesService) {}

  @Post()
  @Roles(Rol.PROFESOR)
  crear(@Body() dto: CrearQuizDto, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.crear(dto, actor);
  }

  @Get()
  @Roles(Rol.PROFESOR, Rol.ESTUDIANTE)
  listar(@UsuarioActual() actor: UsuarioToken) {
    return this.quices.listar(actor);
  }

  @Get(':id')
  @Roles(Rol.PROFESOR, Rol.ESTUDIANTE)
  obtener(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.obtener(id, actor);
  }

  @Post(':id/asignaciones')
  @Roles(Rol.PROFESOR)
  asignar(
    @Param('id') id: string,
    @Body() dto: AsignarQuizDto,
    @UsuarioActual() actor: UsuarioToken,
  ) {
    return this.quices.asignar(id, dto.grupoIds, actor);
  }

  @Post(':id/iniciar')
  @Roles(Rol.ESTUDIANTE)
  iniciar(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.iniciar(id, actor);
  }

  @Post(':id/responder')
  @Roles(Rol.ESTUDIANTE)
  responder(
    @Param('id') id: string,
    @Body() dto: ResponderDto,
    @UsuarioActual() actor: UsuarioToken,
  ) {
    return this.quices.responder(id, dto, actor);
  }

  @Post(':id/finalizar')
  @Roles(Rol.ESTUDIANTE)
  finalizar(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.finalizar(id, actor);
  }

  @Get(':id/resultado')
  @Roles(Rol.ESTUDIANTE)
  miResultado(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.miResultado(id, actor);
  }

  @Get(':id/resultados')
  @Roles(Rol.PROFESOR)
  resultados(@Param('id') id: string, @UsuarioActual() actor: UsuarioToken) {
    return this.quices.resultados(id, actor);
  }
}
