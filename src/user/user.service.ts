import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUserByUsername = await this.userModel
      .findOne({ username: createUserDto.username })
      .exec();
    if (existingUserByUsername) {
      throw new BadRequestException('Username alerady exists');
    }

    const existingUserByEmail = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUserByEmail) {
      throw new BadRequestException('Email alerady exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createUser = new this.userModel({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
    });
    return createUser.save();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    refreshTokenExpiresAt: Date | null,
  ): Promise<UserDocument | null> {
    const updateUser = this.userModel
      .findByIdAndUpdate(
        userId,
        {
          refreshToken: refreshToken,
          refreshTokenExpiresAt: refreshTokenExpiresAt,
        },
        {
          new: true,
        },
      )
      .exec();

    return updateUser;
  }
}
