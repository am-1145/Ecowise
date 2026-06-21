/// <reference types="jest" />

import { describe, it, expect, jest } from '@jest/globals';
import { OcrService } from '../services/ocrService';

// Mock Tesseract recognize to prevent real OCR execution/model downloads in unit tests
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockImplementation(() => Promise.resolve({
    data: {
      text: 'Mock OCR text contents containing $85.50 and 420 kWh utility bill'
    }
  }))
}));

describe('OcrService Tests', () => {
  it('should parse electricity bill and estimate correct carbon impact', async () => {
    const fileBuffer = Buffer.from('mock energy bill');
    const result = await OcrService.parseBillOrReceipt(fileBuffer, 'electric_bill.png', 'bill');

    expect(result.fileType).toBe('bill');
    expect(result.totalConsumptionKwh).toBe(420);
    expect(result.totalCost).toBe(85.50);
    expect(result.estimatedCarbonImpact).toBe(168); // 420 * 0.4
    expect(result.detectedItems[0].name).toBe('Grid Electricity Consumption');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should parse grocery receipt and sum individual item carbon footprint values', async () => {
    const fileBuffer = Buffer.from('mock receipt');
    // Using words that trigger food and shopping keywords: beef, clothes, milk
    const result = await OcrService.parseBillOrReceipt(
      fileBuffer,
      'beef_milk_jeans_receipt.jpg',
      'receipt'
    );

    expect(result.fileType).toBe('receipt');
    expect(result.detectedItems.length).toBe(3); // beef, milk, jeans
    expect(result.detectedItems.map(i => i.name)).toContain('Angus Beef Steak');
    expect(result.detectedItems.map(i => i.name)).toContain('Whole Milk Carton');
    expect(result.detectedItems.map(i => i.name)).toContain('Denim Jeans');

    const expectedCost = 24.99 + 3.49 + 49.99;
    const expectedCo2 = 15.5 + 1.8 + 12.0;

    expect(result.totalCost).toBe(Math.round(expectedCost * 100) / 100);
    expect(result.estimatedCarbonImpact).toBe(Math.round(expectedCo2 * 100) / 100);
  });

  it('should fall back to defaults if no items match grocery receipt search keywords', async () => {
    const fileBuffer = Buffer.from('mock receipt');
    const result = await OcrService.parseBillOrReceipt(fileBuffer, 'unknown_receipt.png', 'receipt');

    expect(result.fileType).toBe('receipt');
    expect(result.detectedItems.length).toBe(2); // mixed basket and fast fashion t-shirt
    expect(result.detectedItems[0].name).toBe('Standard Grocery Basket (Mixed)');
    expect(result.detectedItems[1].name).toBe('Fast Fashion T-shirt');
  });
});
