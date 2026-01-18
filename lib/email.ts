import nodemailer from 'nodemailer';

const buildHtml = (items: Array<{ title: string; url: string; bottomLine: string }>) => {
  const list = items
    .map(
      (item) =>
        `<li style="margin-bottom:16px;"><a href="${item.url}">${item.title}</a><br /><em>${item.bottomLine}</em></li>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;">
      <h2>GI Daily Digest</h2>
      <p>Top papers from today:</p>
      <ol>${list}</ol>
    </div>
  `;
};

const buildText = (items: Array<{ title: string; url: string; bottomLine: string }>) =>
  items
    .map((item, index) => `${index + 1}. ${item.title}\n${item.bottomLine}\n${item.url}`)
    .join('\n\n');

export const sendDigestEmail = async (params: {
  to: string;
  from: string;
  subject: string;
  items: Array<{ title: string; url: string; bottomLine: string }>;
}) => {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: buildHtml(params.items),
        text: buildText(params.items)
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Resend error: ${message}`);
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });

  await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    text: buildText(params.items),
    html: buildHtml(params.items)
  });
};
