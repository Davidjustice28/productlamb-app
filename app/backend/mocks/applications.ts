export interface Application {id: number, name: string, img_url?: string, description: string}

export const mockApplications: Array<Application> = [
  {
    id: 0,
    name: "Talo",
    img_url: 'https://storage.googleapis.com/product-lamb-images/talo_logo_icon.png',
    description: "iOS mobile app that helps minorities learn and engage with their culture."
  },
  {
    id: 1,
    name: "CodeAudit",
    description: "CLI tool that helps Go, Python, and Node.js developers find syntax discrepancies in their code."
  },
  {
    id: 2,
    name: "ProductLamb",
    img_url: 'https://storage.googleapis.com/product-lamb-images/productlamb_logo_icon.png',
    description: "SaaS platform that helps solo developers and small teams manage their projects and tasks. The goal is to provide product management services to those who can't afford a full-time product manager."
  },
  {
    id: 3,
    name: "Brokersphere",
    img_url: 'https://storage.googleapis.com/product-lamb-images/Untitled%20design-3.png',
    description: "Web app that helps real estate agents share leads and referrals. One platform to find a broker, share leads, and get paid for referrals."
  }
]