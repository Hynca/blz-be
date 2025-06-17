import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcrypt";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  refreshToken: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "refreshToken"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public refreshToken!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Custom instance methods
  public async comparePassword(password: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, this.password);
      console.log("Password match result:", isMatch);
      return isMatch;
    } catch (error) {
      console.error("Error comparing passwords:", error);
      console.error("Error details:", JSON.stringify(error));
      return false;
    }
  }
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
