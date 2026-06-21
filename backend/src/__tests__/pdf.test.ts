/// <reference types="jest" />

import { describe, it, expect } from '@jest/globals';
import { PdfService, IReportData } from '../services/pdfService';

describe('PdfService Tests', () => {
  it('should successfully build a PDF report Buffer with custom report telemetry stats', async () => {
    const testReportData: IReportData = {
      userName: 'Eco Warrior',
      email: 'warrior@ecowise.ai',
      points: 450,
      level: 3,
      streak: 5,
      stats: {
        transportation: 120.5,
        energy: 230.4,
        food: 95.0,
        shopping: 40.0,
        waste: 15.0,
        water: 12.0,
        total: 512.9
      },
      goals: [
        {
          title: 'Reduce Driving Commute',
          category: 'transportation',
          targetValue: 50,
          currentValue: 35,
          status: 'in-progress'
        },
        {
          title: 'Meat-Free Days',
          category: 'food',
          targetValue: 4,
          currentValue: 4,
          status: 'completed'
        }
      ],
      recommendations: [
        'Consolidate trips and replace short car commutes with cycling.',
        'Unplug standby appliances to save energy.',
        'Transition to plant-based diets on weekdays.'
      ]
    };

    const pdfBuffer = await PdfService.generateReport(testReportData);
    
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    
    // Check if the PDF starts with standard PDF header %PDF-1.3 or %PDF-1.4
    const pdfHeader = pdfBuffer.toString('ascii', 0, 8);
    expect(pdfHeader).toContain('%PDF');
  });
});
