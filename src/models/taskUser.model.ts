import { Sequelize, DataTypes, Model } from "sequelize";

export interface TaskUserAttributes {
  id: number;
  taskId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class TaskUser extends Model<TaskUserAttributes> implements TaskUserAttributes {
  public id!: number;
  public taskId!: number;
  public userId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  TaskUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tasks",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "task_users",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["taskId", "userId"],
        },
      ],
    }
  );

  return TaskUser;
};
