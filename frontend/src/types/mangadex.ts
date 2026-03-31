export interface Manga {
  id: string;
  type: string;
  attributes: {
    title: { [key: string]: string };
    description: { [key: string]: string };
    status: string;
    year: number;
    contentRating: string;
    tags: Tag[];
  };
  relationships: Relationship[];
}

export interface Tag {
  id: string;
  attributes: {
    name: { [key: string]: string };
  };
}

export interface Relationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
  };
}

export interface Chapter {
  id: string;
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    publishAt: string;
    readableAt: string;
    pages: number;
  };
}
