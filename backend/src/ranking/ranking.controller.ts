import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, UsuarioActual, UsuarioToken } from '../common/roles';
import { RankingService } from './ranking.service';

@Controller('ranking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RankingController {
  constructor(private readonly ranking: RankingService) {}

  @Get('grupos/:grupoId')
  porGrupo(@Param('grupoId') grupoId: string, @UsuarioActual() actor: UsuarioToken) {
    return this.ranking.porGrupo(grupoId, actor);
  }
}
