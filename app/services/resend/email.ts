import { Resend } from 'resend';


export function wrapEmailSdk(key: string, fromEmail: string) {
  const resend = new Resend(key);
  
  return {
   sendEmail: wrapSendEmail(resend, fromEmail),
    getHTMLTemplate: wrapGetHTMLTemplate
  }
}

type PlatformEvent = 'sprint-ready' | 'sprint-started' | 'new-team-member'

function wrapGetHTMLTemplate(event: PlatformEvent, deepLink: string, appName: string, memberName?: string): string {
  if (event === 'sprint-ready') {
    return sprintReadyTemplate(deepLink, appName);
  } else if (event === 'new-team-member') {
    return newTeamMemberTemplate(deepLink, memberName);
  } else {
    return sprintStartedTemplate(deepLink, appName);
  }
}

function wrapSendEmail(client: Resend, from_email: string) {
  return async function sendEmail(recipientEmails: string[], subject: string, html: string) {
    try {
      const data = await client.emails.send({
        from: from_email,
        to: recipientEmails,
        subject,
        html,
      });
      console.log('Email sent successfully:', data);
      return data
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

const sprintReadyTemplate = (deepLink: string, appName: string) => `
<div class="container">
  <div class="header">
    <h1>Sprint Planning Session</h1>
  </div>
  <div class="content">
    <p>Hey there,</p>
    <p>We're just reaching out to let you know that the next sprint planning session for ${appName} is ready to be conducted.</p>
    <p>Remember to complete the quick planning session within the next 24 hours or no tasks will be included in this iteration.</p>
    <a href="${deepLink}" class="button">View Sprint Planning Link</a>
    <p>Happy planning,</p>
    <p>ProductLamb</p>
  </div>
</div>
`

const newTeamMemberTemplate = (deepLink: string, name: string = 'a team member') => `
<div class="container">
  <div class="content">
    <p>How exciting!</p>
    <p>Looks like ${name} completed registration to access your ProductLamb portal.</p>
    <p>To see and manage your team's access, visit your portal's team <a href="${deepLink}" class="button">page</a>.</p>
    <p>If you don't recognize this person or didn't send any invitations, please reach out to us immediately at support@productlamb.com</p>
    <p>Happy planning,</p>
    <p>ProductLamb</p>
  </div>
</div>
`

const sprintStartedTemplate = (deepLink: string, appName: string) => `
<div class="container">
  <div class="header">
    <h1>Sprint Started</h1>
  </div>
  <div class="content">
    <p>Hey there,</p>
    <p>We're excited to let you know that the sprint for ${appName} has started.</p>
    <p>Remember to check your tasks and start working on them. If you have any questions, feel free to reach out to your team lead.</p>
    <a href="${deepLink}" class="button">View Sprint Tasks</a>
    <p>Happy sprinting,</p>
    <p>ProductLamb</p>
  </div>  
</div>
`