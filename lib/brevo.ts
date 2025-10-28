type BrevoContactPayload = {
  email: string
  attributes?: Record<string, string>
  listIds?: number[]
  updateEnabled?: boolean
}

type BrevoEmailPayload = {
  to: Array<{ email: string; name?: string }>
  templateId?: number
  subject?: string
  htmlContent?: string
  params?: Record<string, string>
}

export async function brevoUpsertContact(email: string, name?: string, status: 'pending' | 'confirmed' = 'pending') {
  const apiKey = process.env.BREVO_API_KEY
  const listIdRaw = process.env.BREVO_LIST_ID
  if (!apiKey || !listIdRaw) return { synced: false, reason: 'missing_config' }

  const listId = Number(listIdRaw)
  if (!Number.isFinite(listId)) return { synced: false, reason: 'bad_list_id' }

  const payload: BrevoContactPayload = {
    email,
    attributes: name ? { FIRSTNAME: name, STATUS: status } : { STATUS: status },
    listIds: status === 'confirmed' ? [listId] : [], // Only add to list when confirmed
    updateEnabled: true,
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (res.ok) return { synced: true }

  // If contact exists, update status and list membership
  if (res.status === 400) {
    const putRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify({
        attributes: name ? { FIRSTNAME: name, STATUS: status } : { STATUS: status },
        listIds: status === 'confirmed' ? [listId] : [],
        unlinkListIds: status === 'pending' ? [listId] : [],
      }),
    })
    return { synced: putRes.ok }
  }

  return { synced: false, reason: `status_${res.status}` }
}

export async function brevoSendConfirmationEmail(email: string, name: string, confirmationUrl: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { sent: false, reason: 'missing_config' }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@studio-insight.nl'
  const senderName = process.env.BREVO_SENDER_NAME || 'Studio Insight'

  const payload: BrevoEmailPayload = {
    to: [{ email, name }],
    subject: 'Bevestig je inschrijving voor Studio Insight',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welkom bij Studio Insight!</h2>
        <p>Hallo ${name || 'daar'},</p>
        <p>Bedankt voor je inschrijving op onze nieuwsbrief. Klik op de onderstaande knop om je inschrijving te bevestigen:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Bevestig inschrijving</a>
        </div>
        <p>Als je niet hebt ingeschreven voor onze nieuwsbrief, kun je deze e-mail negeren.</p>
        <p>Met vriendelijke groet,<br>Het Studio Insight team</p>
      </div>
    `,
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      ...payload,
    }),
  })

  let details: any = undefined
  try { details = await res.json() } catch {}
  return { sent: res.ok, status: res.status, details }
}

export async function brevoSendWelcomeEmail(email: string, name?: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { sent: false, reason: 'missing_config' }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@studio-insight.nl'
  const senderName = process.env.BREVO_SENDER_NAME || 'Studio Insight'

  const payload: BrevoEmailPayload = {
    to: [{ email, name }],
    subject: 'Welkom bij Studio Insight 👋',
    htmlContent: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 660px; margin: 0 auto; background: #0b0f17; color: #e6e9ef; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 28px 32px;">
          <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">Welkom bij Studio Insight</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">${name ? `Hi ${name},` : 'Hi,'} leuk dat je er bent! 🎉</p>
        </div>

        <div style="padding: 28px 32px;">
          <p style="margin: 0 0 16px;">Je aanmelding is bevestigd. Vanaf nu ontvang je periodiek waardevolle inzichten, tips en exclusieve updates over onze cursussen en e‑books.</p>
          <ul style="margin: 0 0 16px 18px; padding: 0;">
            <li>Praktische marketing- en business tips</li>
            <li>Early access tot nieuwe cursussen</li>
            <li>Exclusieve aanbiedingen en kortingen</li>
          </ul>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-insight.nl'}" style="background:#0ea5e9; color:#0b0f17; text-decoration:none; padding:12px 22px; border-radius:10px; display:inline-block; font-weight:600;">Bekijk onze cursussen</a>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Geen interesse meer? Je kunt je op elk moment uitschrijven via de link onderaan onze mails.</p>
        </div>

        <div style="padding: 18px 32px; border-top: 1px solid #1b2333; font-size: 12px; opacity: .75;">
          Studio Insight • ${new Date().getFullYear()}
        </div>
      </div>
    `,
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      ...payload,
    }),
  })

  let details: any = undefined
  try { details = await res.json() } catch {}
  return { sent: res.ok, status: res.status, details }
}


