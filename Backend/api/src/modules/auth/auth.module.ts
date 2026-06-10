import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCoordinator } from './auth.coordinator';
import { AuthService } from './auth.service';
import { AuthRepoData } from './repositories/auth.repoData';

@Module({
    controllers: [AuthController],
    providers: [AuthCoordinator, AuthService, AuthRepoData],
    exports: [AuthService, AuthRepoData],
})
export class AuthModule { }