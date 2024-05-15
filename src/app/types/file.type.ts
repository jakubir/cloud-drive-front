export interface File {
  name: string;
  type: 'file' | 'directory';
  date?: string;
  size?: number;
  children: File[];
}
