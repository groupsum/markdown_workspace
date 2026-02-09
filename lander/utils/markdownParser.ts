export interface ParsedMarkdown {
  metadata: Record<string, any>;
  content: string;
}

export const parseMarkdown = (raw: string): ParsedMarkdown => {
  const metadata: Record<string, any> = {};
  let content = raw;

  if (raw.startsWith('---')) {
    const endOfFrontmatter = raw.indexOf('---', 3);
    if (endOfFrontmatter !== -1) {
      const frontmatter = raw.substring(3, endOfFrontmatter);
      content = raw.substring(endOfFrontmatter + 3).trim();
      
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(':').trim();
        }
      });
    }
  }

  return { metadata, content };
};

export const extractHeadings = (content: string) => {
  const lines = content.split('\n');
  return lines
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim());
};