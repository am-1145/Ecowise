/// <reference types="jest" />

import { describe, it, expect, jest } from '@jest/globals';
import { MailService } from '../services/mailService';

describe('MailService Tests', () => {
  it('should successfully run in console simulation mode when EMAIL_SERVICE_KEY is missing', async () => {
    // Force email service key to be empty to trigger mock console log simulation
    process.env.EMAIL_SERVICE_KEY = '';

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const success = await MailService.sendWeeklyReport(
      'user@ecowise.ai',
      'Eco Warrior',
      { co2Saved: 25.5, carbonScore: 88, streak: 6 }
    );

    expect(success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OUTBOUND EMAIL SEND SIMULATED]'));

    consoleSpy.mockRestore();
  });
});
