import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import userModel from "./user.model";

// Export these interfaces for reuse in other files
export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes
  extends Optional<TaskAttributes, "id"> {}

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public startAt!: Date;
  public endAt!: Date;
  public location!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association - these will be created by Sequelize when associations are defined
  public getUsers!: () => Promise<any[]>;
  public setUsers!: (users: any[]) => Promise<void>;
  public addUser!: (user: any) => Promise<void>;
  public removeUser!: (user: any) => Promise<void>;
  public countUsers!: () => Promise<number>;
}

export default (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "tasks",
      timestamps: true,
    }
  );

  return Task;
};
