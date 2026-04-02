import { db } from './index'

export async function seed() {
  console.log('Seeding database...')
  
  // Add demo integration
  await db.query(
    `INSERT INTO integrations (id, name, file_path) 
     VALUES ('demo-site', 'Demo Site', 'src/integrations/demo-site.spec.ts')
     ON CONFLICT (id) DO NOTHING`
  )
  
  // Add some example integrations
  const integrations = [
    { id: 'slack', name: 'Slack', filePath: 'src/integrations/slack.spec.ts' },
    { id: 'github', name: 'GitHub', filePath: 'src/integrations/github.spec.ts' },
    { id: 'jira', name: 'Jira', filePath: 'src/integrations/jira.spec.ts' },
    { id: 'notion', name: 'Notion', filePath: 'src/integrations/notion.spec.ts' },
  ]
  
  for (const integration of integrations) {
    await db.query(
      `INSERT INTO integrations (id, name, file_path) 
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [integration.id, integration.name, integration.filePath]
    )
  }
  
  console.log('Seed complete')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('Seeding complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
