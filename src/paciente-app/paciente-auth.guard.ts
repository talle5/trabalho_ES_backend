import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type RequisicaoPaciente = {
  headers: Record<string, string | undefined>;
  pacienteId?: number;
};

// Guard do PACIENTE: só aceita tokens de paciente
@Injectable()
export class PacienteAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequisicaoPaciente>();
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        tipo?: string;
      }>(token);

      if (payload.tipo !== 'paciente') {
        throw new UnauthorizedException('Token inválido');
      }

      request.pacienteId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
