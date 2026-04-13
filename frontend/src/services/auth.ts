export const fakeLogin = (email: string, senha: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "admin@email.com" && senha === "123456") {
        resolve({ token: "fake-token-123" });
      } else {
        reject("Email ou senha inválidos");
      }
    }, 1000);
  });
};