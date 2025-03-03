import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private membershipEndpointEnabled = true;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    if (email !== 'admin@sugria.com') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In production, use hashed password comparison
    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH || '$2b$10$YourHashedPasswordHere',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ email, role: 'admin' });
    return { access_token: token };
  }

  async getAllApplications() {
    return this.prisma.application.findMany({
      include: {
        program: true,
        personal: true,
        farm: true,
        grant: true,
        training: true,
        motivation: true,
        declaration: true,
      },
    });
  }

  setMembershipEndpointStatus(enabled: boolean) {
    this.membershipEndpointEnabled = enabled;
    return { enabled };
  }

  isMembershipEndpointEnabled() {
    return this.membershipEndpointEnabled;
  }
} 