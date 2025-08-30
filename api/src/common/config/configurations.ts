export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  jwtSecret: string;
}

export default (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    port: parseInt(process.env.PORT!, 10) || 3000,
    nodeEnv,
    databaseUrl:
      process.env.DATABASE_URL ||
      'postgresql://user:password@localhost:5432/dbname',
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  };
};
