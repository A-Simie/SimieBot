import { TokenVaultError } from '@auth0/ai/interrupts';
import { tool } from '@langchain/core/tools';
import { GaxiosError } from 'gaxios';
import { google } from 'googleapis';
import { z } from 'zod';

import { getAccessToken } from '../auth0-ai';
import { toTypedToolError } from './tool-errors';

const base64UrlEncode = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const joinRecipients = (items?: string[]) => (items && items.length ? items.join(', ') : undefined);

export const sendGmailMessageTool = tool(
  async ({ to, cc, bcc, subject, bodyText, replyTo }) => {
    try {
      const normalizedSubject = subject.trim();
      const normalizedBodyText = bodyText.trim();

      if (!normalizedSubject) {
        return toTypedToolError('send_gmail_message', new Error('The email subject cannot be empty.'));
      }

      if (!normalizedBodyText) {
        return toTypedToolError('send_gmail_message', new Error('The email body cannot be empty.'));
      }

      const accessToken = await getAccessToken();
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth });

      const lines = [
        `To: ${to.join(', ')}`,
        joinRecipients(cc) ? `Cc: ${joinRecipients(cc)}` : null,
        joinRecipients(bcc) ? `Bcc: ${joinRecipients(bcc)}` : null,
        replyTo ? `Reply-To: ${replyTo}` : null,
        `Subject: ${normalizedSubject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        normalizedBodyText,
      ].filter((line): line is string => line !== null);

      const raw = base64UrlEncode(lines.join('\r\n'));
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
        },
      });

      return {
        status: 'sent',
        messageId: response.data.id,
        threadId: response.data.threadId,
        to,
        subject: normalizedSubject,
        bodyPreview:
          normalizedBodyText.length > 160
            ? `${normalizedBodyText.slice(0, 160).trimEnd()}...`
            : normalizedBodyText,
      };
    } catch (error) {
      if (error instanceof GaxiosError && (error.status === 401 || error.status === 403)) {
        throw new TokenVaultError('Authorization required to send a Gmail message.');
      }

      return toTypedToolError('send_gmail_message', error);
    }
  },
  {
    name: 'send_gmail_message',
    description: 'Send a real email through the connected Gmail account.',
    schema: z.object({
      to: z.array(z.string().email()).min(1).describe('Recipient email addresses.'),
      cc: z.array(z.string().email()).optional().describe('Optional CC email addresses.'),
      bcc: z.array(z.string().email()).optional().describe('Optional BCC email addresses.'),
      subject: z.string().trim().min(1).describe('Email subject line.'),
      bodyText: z
        .string()
        .trim()
        .min(1)
        .describe('Plain-text body of the email. Use the actual message the user wants sent, not a summary placeholder.'),
      replyTo: z.string().email().optional().describe('Optional reply-to email address.'),
    }),
  },
);
