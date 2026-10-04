import bcrypt from "bcryptjs";

export const hashPassword = async (text: string, salt: number) => {
  const hashedText = await bcrypt.hash(text, salt);
  return hashedText;
};

export const compareHash = async (
  text: string,
  hash: string,
): Promise<boolean> => {
  const result = await bcrypt.compare(text, hash);
  return result;
};
