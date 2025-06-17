// Repository pattern for User data access
import db from "../models";
import { UserAttributes, UserCreationAttributes } from "../models/user.model";

const User = db.users;

export class UserRepository {
  async findByEmail(email: string): Promise<UserAttributes | null> {
    return (await User.findOne({
      where: { email },
      raw: true,
    })) as UserAttributes | null;
  }

  async findById(id: number): Promise<UserAttributes | null> {
    return (await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      raw: true,
    })) as UserAttributes | null;
  }

  async create(user: UserCreationAttributes): Promise<UserAttributes> {
    return await User.create(user);
  }

  async update(id: number, data: Partial<UserAttributes>): Promise<number> {
    const [affectedCount] = await User.update(data, {
      where: { id },
    });

    return affectedCount;
  }

  async delete(id: number): Promise<number> {
    return await User.destroy({
      where: { id },
    });
  }

  async authenticate(
    email: string,
    password: string
  ): Promise<UserAttributes | null> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user.get({ plain: true });
    return userWithoutPassword as UserAttributes;
  }
}

export const userRepository = new UserRepository();
