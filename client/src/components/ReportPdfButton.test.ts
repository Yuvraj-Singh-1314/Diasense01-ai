import { describe, expect, it } from 'vitest';
import { buildClientReportPdf } from './ReportPdfButton';

describe('ReportPdfButton dynamic patient naming', () => {
  it('writes the supplied authenticated user name into the generated PDF', () => {
    const pdf = buildClientReportPdf('Test Patient');
    const pageOperators = JSON.stringify(pdf.internal.pages);
    expect(pageOperators).toContain('Test Patient');
    expect(pageOperators).toContain('MEDICAL DISCLAIMER');
  });
});
