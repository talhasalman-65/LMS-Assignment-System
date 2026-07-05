const assignmentRepository = require('../repositories/assignmentRepository');
const { auditLog, activityLogger } = require('../utils/logger');

const assignmentService = {
  async create(data, teacherId, actorId) {
    const assignment = await assignmentRepository.create({
      ...data,
      teacherId,
    });

    if (data.targets && data.targets.length > 0) {
      await assignmentRepository.addTargets(assignment.id, data.targets);
    }

    await auditLog.log(actorId, 'assignment_create', 'assignments', assignment.id, null, { title: data.title });
    await activityLogger.log(actorId, 'assignment_created', `Created assignment: ${data.title}`);

    return assignment;
  },

  async getById(id) {
    const assignment = await assignmentRepository.findWithDetails(id);
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  },

  async getAll(filters) {
    return await assignmentRepository.findAll(filters);
  },

  async update(id, data, actorId) {
    const before = await assignmentRepository.findById(id);
    if (!before) throw new Error('Assignment not found');

    const updated = await assignmentRepository.update(id, data);

    if (data.targets) {
      await assignmentRepository.removeTargets(id);
      await assignmentRepository.addTargets(id, data.targets);
    }

    await auditLog.log(actorId, 'assignment_update', 'assignments', id, { title: before.title }, { title: data.title || before.title });
    await activityLogger.log(actorId, 'assignment_updated', `Updated assignment: ${before.title}`);

    return updated;
  },

  async delete(id, actorId) {
    const before = await assignmentRepository.findById(id);
    if (!before) throw new Error('Assignment not found');

    await assignmentRepository.softDelete(id);
    await auditLog.log(actorId, 'assignment_delete', 'assignments', id, { title: before.title }, null);
  },

  async archive(id, actorId) {
    const result = await assignmentRepository.update(id, { isArchived: true });
    await activityLogger.log(actorId, 'assignment_archived', `Archived assignment: ${result.title}`);
    return result;
  },

  async addAttachment(assignmentId, file) {
    return await assignmentRepository.addAttachment({
      assignmentId,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  },

  async getAssignmentStatus(assignment) {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);

    if (assignment.is_archived) return 'Archived';
    if (dueDate < now) return 'Expired';
    if (dueDate <= new Date(now.getTime() + 48 * 60 * 60 * 1000)) return 'Due Soon';
    return 'Active';
  },
};

module.exports = assignmentService;
