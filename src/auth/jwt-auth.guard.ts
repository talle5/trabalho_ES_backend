import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type RequisicaoAutenticada = {
  headers: Record<string, string | undefined>;
  usuarioId?: number;
};

// Guard do FUNCIONÁRIO: recusa tokens de paciente
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequisicaoAutenticada>();
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        tipo?: string;
      }>(token);

      if (payload.tipo !== 'funcionario') {
        throw new UnauthorizedException('Token inválido');
      }

      request.usuarioId = payload.sub;
      return true;
    } catch (erro) {
      if (erro instanceof UnauthorizedException) {
        throw erro;
      }

      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
