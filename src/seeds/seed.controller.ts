import { Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../user/models/user.model';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  @Post('scramble-emails')
  @ApiOperation({
    summary: 'Scramble all user email addresses',
    description:
      'Replaces every user\'s email with a random spam address so existing accounts can no longer be used. Returns the count changed and a before/after list. Run this before opening registration to new users, then drop the DB when done.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Emails scrambled' })
  async scrambleEmails() {
    try {
      const users = await this.userModel.findAll({
        attributes: ['id', 'email'],
        where: { email: { [Op.ne]: 'admin@local.local' } },
      });

      const changes: { id: string; previousEmail: string; newEmail: string }[] = [];

      for (const user of users) {
        const previousEmail = user.email;
        const newEmail = `archived_${Date.now()}_${Math.random().toString(36).slice(2, 10)}@noreply.invalid`;

        await user.update({ email: newEmail });

        changes.push({ id: user.id, previousEmail, newEmail });
      }

      return {
        status: HttpStatus.OK,
        message: `${changes.length} user email(s) scrambled`,
        count: changes.length,
        data: changes,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to scramble emails',
        error: error?.message,
      };
    }
  }
}
