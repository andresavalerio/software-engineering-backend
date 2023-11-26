import { type Response, type Request, Router } from "express";
import { IController } from "../../../interfaces/controller.interface";
import {
  UserDuplicateError,
  UserNotFoundError,
  UserTokenError,
  UserWrongPasswordError,
} from "../user.errors";
import { CreateUserDTO, IUserService, UserLoginDTO } from "../user.interfaces";

export class UserController implements IController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response) {
    const createUserData = req.body as CreateUserDTO;

    const toVerifyKeys: Array<keyof CreateUserDTO> = [
      "email",
      "fullName",
      "password",
      "username",
    ];

    for (const key of toVerifyKeys)
      if (!createUserData[key])
        return res.status(400).json({ msg: `missing ${key} value` });

    try {
      await this.userService.createUser(createUserData);

      return res.status(201).json();
    } catch (error) {
      if (error instanceof UserDuplicateError) {
        return res.status(409).json({ msg: "duplicated user" });
      } else {
        return res.status(500).json();
      }
    }
  }

  async loginUser(req: Request, res: Response) {
    const loginUserData = req.body as UserLoginDTO;

    const hasLogin = !!loginUserData.login;
    const hasPassword = !!loginUserData.password;

    if (!hasLogin) return res.status(400).json({ msg: "missing login value" });
    if (!hasPassword)
      return res.status(400).json({ msg: "missing password value" });

    try {
      const result = await this.userService.loginUser(loginUserData);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof UserNotFoundError)
        res.status(409).json({ msg: "user not found" });
      else if (error instanceof UserWrongPasswordError)
        res.status(401).json({ msg: "unauthorized user" });
      else res.status(500).json();
    }
  }

  async getUser(req: Request, res: Response) {
    const authorization = req.headers["authorization"];

    if (typeof authorization !== "string")
      return res
        .status(400)
        .json({ msg: "Header sem o token de autorização." });

    const matchResult = authorization.match(/^Bearer ([^ ]+)$/);

    if (!matchResult)
      return res
        .status(400)
        .json({ msg: "Autorização não está nos padrões necessária." });

    const token = matchResult[1];

    try {
      const data = this.userService.getUser(token);

      res.status(200).json(data);
    } catch (error) {
      if (error instanceof UserTokenError)
        return res.status(401).json({ msg: "Token Inválido." });

      res.status(500).json({ msg: "Internal Server Error." });
    }
  }

  getRouter(): Router {
    const router = Router();

    router.get("/", async (req, res) => {
      await this.getUser(req, res);
    });

    router.post("/", async (req, res) => {
      await this.createUser(req, res);
    });

    router.post("/login", async (req, res) => {
      await this.loginUser(req, res);
    });

    return router;
  }
}
