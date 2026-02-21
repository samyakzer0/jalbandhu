declare module 'stopword' {
  export function removeStopwords(
    words: string[],
    stopwords?: string[]
  ): string[];
  
  export const eng: string[];
  export const hin: string[];
  export const tam: string[];
  export const ben: string[];
}
