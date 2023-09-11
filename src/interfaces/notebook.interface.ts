export interface CreateNotebookDTO {
  title: string;
  notes: string;
  username: string;
}

export interface Notebook {
  id: string;
  title: string;
  notes: string;
  username: string;
}

export interface INotebookService {
  createNotebook(notebook: CreateNotebookDTO): string;
}

export interface INotebookRepository {
  insertNotebook(notebook: Notebook): boolean;
}