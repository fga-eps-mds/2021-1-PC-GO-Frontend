import { STORAGE_KEY } from "../../Auth/Auth";
import { APIProfile } from "./BaseService/index";

function getToken() {
  return String(localStorage.getItem(STORAGE_KEY));
}

const userLevels = [
  {
    level: 1,
    description: "admin",
  },
  {
    level: 2,
    description: "common",
  },
];

async function validateUser(user) {
  const section = Number.parseInt(user.sectionID);
  const department = Number.parseInt(user.departmentID);
  let level = Number.parseInt(user.level);

  level =
    level !== userLevels[0].level && level !== userLevels[1].level
      ? userLevels[1].level
      : level;

  if (section <= 0 || department <= 0) {
    throw new Error("invalid department or section");
  }

  return {
    email: user.email,
    password: user.password,
    sectionID: section,
    departmentID: department,
    level: level,
  };
}

export async function registerUser(usr, toast) {
  try {
    const user = await validateUser(usr);

    await APIProfile.post(
      "/register",
      {
        email: user.email,
        password: user.password,
        departmentID: user.departmentID,
        sectionID: user.sectionID,
        level: user.level,
      },
      { headers: { "X-Access-Token": getToken() } }
    );

    toast.success("Usuário cadastrado com sucesso");
  } catch (err) {
    const status = err.response?.status;

    if (status === 401) {
      toast.error("Você não possui privilégios suficientes para realizar esta ação");
    } else if (status === 400) {
      toast.error("Faltam algumas informações para realizar o cadastro do usuário");
    } else {
      toast.error(`Erro ao cadastrar usuário!`);
    }

    console.error(`erro ao cadastrar usuário: ${err}`);
  }
}

export async function loginUser(user, toast) {
  try {
    const response = await APIProfile.post("/login", {
      email: user.email,
      password: user.password,
    });

    APIProfile.defaults.headers.common["x-access-token"] = response.data.token;

    return response.data;
  } catch (err) {
    const status = err.response?.status;

    if (status === 401) {
      toast.error("Usuário e/ou senha inválidos");
    } else if (status === 400) {
      toast.error("Requisição inválida");
    } else {
      toast.error("Não foi possivel fazer login. Tente novamente mais tarde.");
    }

    console.error(err);
    return null;
  }
}

export async function listAllUsers(toast) {
  try {
    const response = await APIProfile.post(
      "/users/all",
      {},
      {
        headers: { "X-Access-Token": getToken() },
      }
    );
    return response.data;
  } catch (err) {
    const status = err.response?.status;

    if (status === 401) {
      toast.error("Você não possui privilégios suficientes para realizar esta ação");
    }
  }
}

export async function getUserAccessLevel(user, toast) {
  try {
    const response = await APIProfile.post(
      "/user/access-level",
      {},
      { headers: { "X-Access-Token": getToken() } }
    );
    return response.data;
  } catch (err) {
    const status = err.response?.status;

    if (status === 500) {
      toast.error("Erro ao obter informações sobre o seu nível de acesso");
    }
  }
}

export async function getProfileInfo(toast) {
  try {
    const response = await APIProfile.get("/user/info", {
      headers: { "X-Access-Token": getToken() },
    });

    console.info(`user profile returned successfully`);
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 500) {
      console.error(`server error detected: ${error}`);
    } else {
      toast.error("Erro ao obter informações sobre o perfil");
    }

    return null;
  }
}
