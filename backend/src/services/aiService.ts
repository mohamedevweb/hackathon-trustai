export async function analyzeProject(url: string): Promise<{ validated: boolean; aiScore: number }> {
  if (typeof url === 'string' && url.toLowerCase().includes('github')) {
    return { validated: true, aiScore: 95 }
  }
  return { validated: false, aiScore: 40 }
}
