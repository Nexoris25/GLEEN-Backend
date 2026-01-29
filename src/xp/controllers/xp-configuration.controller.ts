import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    Param, UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiResponse, ApiBearerAuth,
    
} from '@nestjs/swagger';
import { XpConfigurationService } from '../services/xp-configuration.service';
import { CreateXpConfigurationDto } from '../dto/create-xp-configuration.dto';
import { XpConfiguration } from '../models/xp-configuration.model';
import { UpdateXpConfigurationDto } from '../dto/update-xp-configuration.dto';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';


@ApiTags('XP Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('xp-configuration')
export class XpConfigurationController {

    constructor(private readonly xpConfigurationService: XpConfigurationService) { }
/*
    @Post()
    @ApiOperation({
        summary: 'Create XP configuration',
        description: 'Create the single XP configuration for the system. This can only be done once.',
    })
    @ApiBody({
        type: CreateXpConfigurationDto,
        description: 'XP configuration data',
    })
    @ApiResponse({
        description: 'XP configuration successfully created',
        type: ResponseDto<XpConfiguration>,
    })
    async create(@Body() createXpConfigurationDto: CreateXpConfigurationDto): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.create(createXpConfigurationDto);
            return { status: HttpStatus.OK, message: 'xp configuarion created sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Post('initialize-default')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Initialize default configuration',
        description: 'Initialize the system with default XP configuration values if none exists.',
    })
    @ApiResponse({
        description: 'Default XP configuration initialized or already exists',
        type: ResponseDto<XpConfiguration>,
    })
    async initializeDefaultConfiguration(): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.initializeDefaultConfiguration();
            return { status: HttpStatus.OK, message: 'xp configuarion created sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
*/
    @Get()

      @Roles('ADMIN', 'SUPER_ADMIN', 'TUTOR', 'USER')
    @ApiOperation({
        summary: 'Get XP configuration',
        description: 'Retrieve the single XP configuration for the system.',
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP configuration',
        type: ResponseDto<XpConfiguration>,
    })
    async findOne(): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.findOne();
            return { status: HttpStatus.OK, message: 'xp configuarion retrived sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retreiviing xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Patch()
  @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Update XP configuration. Admin, Super Admin',
        description: 'Update the single XP configuration for the system.',
    })
    @ApiBody({
        type: UpdateXpConfigurationDto,
        description: 'Partial XP configuration data for update',
    })
    @ApiResponse({
        description: 'XP configuration successfully updated',
        type: ResponseDto<XpConfiguration>,
    })
    async update(
        @Body() updateXpConfigurationDto: UpdateXpConfigurationDto,
    ): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.update(updateXpConfigurationDto);
            return { status: HttpStatus.OK, message: 'xp configuarion updated sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error updating xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    /*

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete XP configuration',
        description: 'Permanently delete the XP configuration. Use with caution.',
    })
    @ApiNoContentResponse({
        description: 'XP configuration successfully deleted',
    })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            await this.xpConfigurationService.remove(id);
            return { status: HttpStatus.OK, message: 'xp configuarion deleted sucessfully', data: null };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error deleting xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
    */
}