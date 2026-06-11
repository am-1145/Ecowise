import PDFDocument from 'pdfkit';

export interface IReportData {
  userName: string;
  email: string;
  points: number;
  level: number;
  streak: number;
  stats: {
    transportation: number;
    energy: number;
    food: number;
    shopping: number;
    waste: number;
    water: number;
    total: number;
  };
  goals: {
    title: string;
    category: string;
    targetValue: number;
    currentValue: number;
    status: string;
  }[];
  recommendations: string[];
}

export class PdfService {
  /**
   * Generates a beautifully styled, corporate-grade PDF Sustainability Report
   */
  static async generateReport(data: IReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // Colors
        const primaryColor = '#10b981'; // Emerald Green
        const darkColor = '#1e293b'; // Slate Blue/Gray
        const lightGray = '#f1f5f9';

        // Title Page Header
        doc
          .fillColor(primaryColor)
          .fontSize(28)
          .font('Helvetica-Bold')
          .text('EcoWise AI', 50, 60);

        doc
          .fillColor(darkColor)
          .fontSize(14)
          .font('Helvetica')
          .text('Personal Carbon Footprint & Sustainability Report', 50, 95);

        // Horizontal line
        doc
          .strokeColor(primaryColor)
          .lineWidth(2)
          .moveTo(50, 115)
          .lineTo(545, 115)
          .stroke();

        // User Metadata Section
        doc
          .fillColor(darkColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('PREPARED FOR:', 50, 140)
          .font('Helvetica')
          .text(`${data.userName} (${data.email})`, 160, 140)
          .font('Helvetica-Bold')
          .text('REPORT GENERATED:', 50, 160)
          .font('Helvetica')
          .text(new Date().toLocaleDateString(), 160, 160)
          .font('Helvetica-Bold')
          .text('SUSTAINABILITY LEVEL:', 50, 180)
          .font('Helvetica')
          .text(`Level ${data.level} | Points: ${data.points} | Streak: ${data.streak} Days`, 160, 180);

        // Section 1: Footprint Analysis
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('1. Carbon Footprint Breakdown', 50, 220);

        doc
          .fillColor(darkColor)
          .fontSize(10)
          .font('Helvetica')
          .text('Estimated monthly carbon emissions across your lifestyle categories (values in kg CO₂):', 50, 245);

        // Draw Table Background
        let currentY = 270;
        const categories = [
          { label: 'Transportation (Commuting, flights)', value: `${data.stats.transportation} kg` },
          { label: 'Household Energy (Electricity, AC, gas)', value: `${data.stats.energy} kg` },
          { label: 'Food Intake & Diet selections', value: `${data.stats.food} kg` },
          { label: 'Shopping & Consumer Goods', value: `${data.stats.shopping} kg` },
          { label: 'Waste Management (Recyclables & trash)', value: `${data.stats.waste} kg` },
          { label: 'Water Usage', value: `${data.stats.water} kg` },
        ];

        // Draw categories
        categories.forEach((cat, idx) => {
          // Zebra striping
          if (idx % 2 === 0) {
            doc.rect(50, currentY - 4, 495, 20).fill(lightGray);
          }
          doc
            .fillColor(darkColor)
            .font('Helvetica')
            .text(cat.label, 60, currentY)
            .text(cat.value, 420, currentY, { align: 'right', width: 100 });
          currentY += 20;
        });

        // Add Total row
        doc
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .moveTo(50, currentY + 2)
          .lineTo(545, currentY + 2)
          .stroke();

        currentY += 8;
        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Total Footprint Carbon Load', 60, currentY)
          .text(`${data.stats.total} kg CO₂`, 420, currentY, { align: 'right', width: 100 });

        // Section 2: Goals Progress
        currentY += 40;
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('2. Goals & Milestones Progress', 50, currentY);

        currentY += 25;
        if (data.goals.length === 0) {
          doc
            .fillColor(darkColor)
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text('No active or previous carbon reduction goals recorded yet. Set some targets to accelerate your journey!', 50, currentY);
          currentY += 20;
        } else {
          data.goals.slice(0, 3).forEach((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
            doc
              .fillColor(darkColor)
              .fontSize(11)
              .font('Helvetica-Bold')
              .text(goal.title, 50, currentY);
            doc
              .fontSize(10)
              .font('Helvetica')
              .text(`Category: ${goal.category} | Status: ${goal.status} | Completion: ${pct}%`, 50, currentY + 14);

            // Progress bar border
            doc.rect(50, currentY + 30, 250, 6).stroke('#cbd5e1');
            // Progress bar fill
            if (pct > 0) {
              doc.rect(50, currentY + 30, (250 * pct) / 100, 6).fill(primaryColor);
            }
            currentY += 48;
          });
        }

        // Section 3: AI Recommendations
        currentY += 20;
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('3. AI Personalized Carbon Reduction Plan', 50, currentY);

        currentY += 25;
        data.recommendations.forEach((rec, idx) => {
          doc
            .fillColor(darkColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`${idx + 1}.`, 50, currentY, { width: 15 })
            .text(rec, 70, currentY, { width: 475 });
          // Get text height to offset dynamically
          const height = doc.heightOfString(rec, { width: 475 });
          currentY += height + 10;
        });

        // Footer
        doc
          .fontSize(8)
          .fillColor('#94a3b8')
          .text('EcoWise AI - Make Earth Greener, One Choice At A Time.', 50, 780, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
