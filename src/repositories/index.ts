// Export all repositories
import { taskRepository } from "./task.repository";
import { userRepository } from "./user.repository";

export { taskRepository, userRepository };

// Default export
export default {
  tasks: taskRepository,
  users: userRepository,
};
