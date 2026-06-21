import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const FORM_FIELD_SCHEMAS = {
  contact: z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().max(50).optional().or(z.literal('')),
    message: z.string().trim().min(1, 'Message is required').max(5000),
  }),
  demo: z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    email: z.string().trim().email('Invalid email address'),
    company: z.string().trim().min(1, 'Company is required').max(200),
    phone: z.string().trim().max(50).optional().or(z.literal('')),
    message: z.string().trim().max(5000).optional().or(z.literal('')),
  }),
  partnership: z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    email: z.string().trim().email('Invalid email address'),
    company: z.string().trim().min(1, 'Company is required').max(200),
    website: z.string().trim().max(300).optional().or(z.literal('')),
    message: z.string().trim().min(1, 'Message is required').max(5000),
  }),
} as const;

type FormType = keyof typeof FORM_FIELD_SCHEMAS;

const FORM_LABELS: Record<FormType, string> = {
  contact: 'Contact Request',
  demo: 'Demo Request',
  partnership: 'Partnership Request',
};

const RequestSchema = z.object({
  formType: z.enum(['contact', 'demo', 'partnership']),
  destinationEmail: z.string().trim().email('Invalid destination email'),
  fields: z.record(z.string(), z.string()),
  pageUrl: z.string().trim().max(500).optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(formType: FormType, fields: Record<string, string>, pageUrl?: string) {
  const rows = Object.entries(fields)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#334155;text-transform:capitalize;">${escapeHtml(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#0f172a;">New ${FORM_LABELS[formType]}</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>
      ${pageUrl ? `<p style="margin-top:16px;color:#64748b;font-size:13px;">Submitted from: ${escapeHtml(pageUrl)}</p>` : ''}
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'validation_failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { formType, destinationEmail, fields, pageUrl } = parsed.data;
    const fieldSchema = FORM_FIELD_SCHEMAS[formType];
    const fieldsResult = fieldSchema.safeParse(fields);

    if (!fieldsResult.success) {
      return NextResponse.json(
        { success: false, error: 'validation_failed', details: fieldsResult.error.issues },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'email_not_configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || 'onboarding@resend.dev';

    const { error } = await resend.emails.send({
      from: `Website Forms <${fromEmail}>`,
      to: destinationEmail,
      replyTo: fieldsResult.data.email,
      subject: `${FORM_LABELS[formType]} — ${fieldsResult.data.name}`,
      html: buildEmailHtml(formType, fieldsResult.data, pageUrl),
    });

    if (error) {
      console.error('Resend send error:', error);
      return NextResponse.json({ success: false, error: 'send_failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form submission error:', err);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}
