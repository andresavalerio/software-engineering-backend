import express, { type Express } from "express";
import {
  CreateNotebookDTO,
  INotebookService,
} from "../../interfaces/notebook.interface";
import { NotebookController } from "./notebook.controller";
import request from "supertest";

class FakeNotebookService implements INotebookService {
  createNotebook(notebook: CreateNotebookDTO): string {
    return "new-id";
  }
}

describe("NotebookController", () => {
  let application: Express;

  const createNotebookData: CreateNotebookDTO = {
    username: "pimpim",
    notes: "content",
    title: "notebook",
  };

  beforeEach(() => {
    application = express();

    application.use(express.json());

    const controller = new NotebookController(new FakeNotebookService());

    application.post("/", (req, res) => {
      controller.createNotebook(req, res);
    });
  });

  it("should be defined", () => {
    expect(application).toBeDefined();
  });

  it("should create notebook", () => {
    return request(application)
      .post("/")
      .send(createNotebookData)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBeDefined();
      });
  });

  it("should not create notebook", () => {
    return request(application)
      .post("/")
      .send({ ...createNotebookData, username: "" })
      .expect(400);
  });
});
