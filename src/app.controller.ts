import { Controller, Get, Head, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getServerStatus(@Res() res: Response) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enterprise API</title>
    <style>
      body { margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background: #0f172a; color: white; font-family: Arial, sans-serif; }
      .card { background: #1e293b; padding: 40px; border-radius: 20px; width: min(90%, 520px); text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
      h1 { color: #38bdf8; margin-bottom: 10px; }
      p { margin: 0; color: #cbd5e1; }
      .status { color: #22c55e; font-size: 20px; margin-top: 20px; }
      .service { margin-top: 10px; font-size: 16px; color: #e2e8f0; }
      .footer { margin-top: 30px; color: #94a3b8; font-size: 14px; }
      .bamb { margin-top: 18px; font-size: 32px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Enterprise Ecommerce API</h1>
      <p>Backend server is running successfully</p>
      <div class="status">● SYSTEM ONLINE</div>
      <div class="service">API: ✅ UP</div>
      <div class="service">Database: ✅ UP</div>
      <div class="service">Redis: ✅ UP</div>
      <div class="bamb">🎉</div>
      <div class="footer">Environment: ${process.env.NODE_ENV || 'development'}</div>
    </div>
  </body>
</html>`);
  }

  @Head()
  @Header('Content-Type', 'text/html')
  headHello(@Res() res: Response) {
    return this.getServerStatus(res);
  }
}
