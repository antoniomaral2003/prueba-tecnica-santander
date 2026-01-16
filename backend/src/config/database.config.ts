import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({

    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', '1234'),
    database: configService.get<string>('DB_DATABASE', 'candidates'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
    logging: configService.get<boolean>('DB_LOGGING', true),

});