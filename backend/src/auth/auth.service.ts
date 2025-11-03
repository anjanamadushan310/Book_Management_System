import { Injectable, UnauthorizedException, ConflictException, BadRequestException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, name } = registerDto;

      // Validate email format (additional validation beyond class-validator)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate name
      if (!name || name.trim().length < 2) {
        throw new BadRequestException('Name must be at least 2 characters long');
      }

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: trimmedEmail },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user - always as USER role (librarians are hardcoded)
      const user = this.userRepository.create({
        email: trimmedEmail,
        name: trimmedName,
        password: hashedPassword,
        role: UserRole.USER, // Force USER role for all registrations
      });

      await this.userRepository.save(user);

      // Generate JWT token
      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Validate input
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const trimmedEmail = email.trim().toLowerCase();

      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: trimmedEmail },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }


}