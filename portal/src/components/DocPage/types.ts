export interface DocPageProps {
  slug?: string;
  className?: string;
}

export interface DocContent {
  title: string;
  description: string;
  sections: DocSection[];
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  filename?: string;
}

