export interface Item {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Bucket {
  id: string;
  name: string;
  items: Item[];
} 